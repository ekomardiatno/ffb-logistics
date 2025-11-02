import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/api";
import { Vehicle } from "../types";

export const fetchVehicles = createAsyncThunk("vehicles/fetch", async () => {
  const res = await api.get<Vehicle[]>("/vehicles");
  return res.data;
});

export const updateVehicleStatus = createAsyncThunk(
  "vehicles/updateStatus",
  async ({
    id,
    status,
  }: {
    id: string;
    status: "idle" | "on_trip" | "maintenance";
  }) => {
    const { data } = await api.patch<Vehicle>(`/vehicles/${id}/status`, {
      status,
    });
    return data;
  }
);

export const assignVehicleDriver = createAsyncThunk(
  "vehicles/assignDriver",
  async ({ id, driverId }: { id: string; driverId: string | null }) => {
    const { data } = await api.patch<Vehicle>(`/vehicles/${id}/assign-driver`, {
      driverId,
    });
    return data;
  }
);

export const createVehicle = createAsyncThunk(
  "vehicles/create",
  async (data: Omit<Vehicle, "id" | "status">, { rejectWithValue }) => {
    try {
      const res = await api.post("/vehicles", data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateVehicle = createAsyncThunk(
  "vehicles/update",
  async ({ id, data }: { id: string; data: Partial<Vehicle> }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/vehicles/${id}`, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

interface VehiclesState {
  items: Vehicle[];
  loading: boolean;
  error?: string | null;
}

const initialState: VehiclesState = { items: [], loading: false, error: null };

const vehiclesSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchVehicles.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchVehicles.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchVehicles.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to load vehicles";
    });

    builder.addCase(updateVehicleStatus.fulfilled, (s, a) => {
      const idx = s.items.findIndex((v) => v.id === a.payload.id);
      if (idx >= 0) s.items[idx] = a.payload;
    });

    builder.addCase(assignVehicleDriver.fulfilled, (s, a) => {
      const idx = s.items.findIndex((v) => v.id === a.payload.id);
      if (idx >= 0) s.items[idx] = a.payload;
    });

    builder.addCase(createVehicle.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });

    builder.addCase(updateVehicle.fulfilled, (state, action) => {
      const idx = state.items.findIndex((v) => v.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    });
  },
});

export default vehiclesSlice.reducer;
