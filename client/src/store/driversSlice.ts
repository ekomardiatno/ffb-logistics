import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/api";
import { Driver } from "../types";

export const fetchDrivers = createAsyncThunk("drivers/fetch", async () => {
  const res = await api.get<Driver[]>("/drivers");
  return res.data;
});

export const updateDriverStatus = createAsyncThunk(
  "drivers/updateStatus",
  async ({ id, status }: { id: string; status: "available" | "on_trip" | "inactive" }) => {
    const { data } = await api.patch<Driver>(`/drivers/${id}/status`, { status });
    return data;
  }
);

export const createDriver = createAsyncThunk(
  "drivers/create", async (data: Omit<Driver, "id">, { rejectWithValue }) => {
    try {
      const res = await api.post<Driver>("/drivers", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateDriver = createAsyncThunk(
  "drivers/update",
  async ({ id, changes }: { id: string; changes: Partial<Omit<Driver, "id">> }, { rejectWithValue }) => {
    try {
      const { data } = await api.put<Driver>(`/drivers/${id}`, changes);
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

interface DriversState {
  items: Driver[];
  loading: boolean;
  error?: string | null;
}

const initialState: DriversState = { items: [], loading: false, error: null };

const driversSlice = createSlice({
  name: "drivers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDrivers.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchDrivers.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchDrivers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to load drivers";
    });

    builder.addCase(updateDriverStatus.fulfilled, (s, a) => {
      const i = s.items.findIndex(d => d.id === a.payload.id);
      if (i >= 0) s.items[i] = a.payload;
    });

    builder.addCase(createDriver.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });

    builder.addCase(updateDriver.fulfilled, (s, a) => {
      const i = s.items.findIndex(d => d.id === a.payload.id);
      if (i >= 0) s.items[i] = a.payload;
    });
  }
});

export default driversSlice.reducer;
