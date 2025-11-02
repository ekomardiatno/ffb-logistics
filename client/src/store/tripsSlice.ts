import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/api";
import { Trip } from "../types";

export const fetchTrips = createAsyncThunk("trips/fetch", async () => {
  const res = await api.get<Trip[]>("/trips");
  return res.data;
});

export const createTrip = createAsyncThunk(
  "trips/create",
  async (payload: {
    vehicleId: string;
    driverId: string;
    mills: { millId: string; plannedCollection: number }[];
    scheduledDate: string;
    estimatedDuration: number;
  }, { rejectWithValue }) => {
    try {
      const res = await api.post<Trip>("/trips", payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err)
    }
  }
);

export const updateTripStatus = createAsyncThunk(
  "trips/updateStatus",
  async ({ id, status }: { id: string; status: Trip["status"] }) => {
    const { data } = await api.patch<Trip>(`/trips/${id}/status`, { status });
    return data;
  }
);

export const deleteTrip = createAsyncThunk("trips/delete", async (id: string) => {
  await api.delete(`/trips/${id}`);
  return id;
});

export const updateTrip = createAsyncThunk(
  "trips/update",
  async ({ id, changes }: { id: string; changes: Partial<Pick<Trip, "scheduledDate" | "estimatedDuration">> & { mills?: { millId: string; plannedCollection: number }[] } }) => {
    const { data } = await api.put<Trip>(`/trips/${id}`, changes);
    return data;
  }
);

interface TripsState {
  items: Trip[];
  loading: boolean;
  error?: string | null;
}

const initialState: TripsState = { items: [], loading: false, error: null };

const tripsSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTrips.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchTrips.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchTrips.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to load trips";
    });

    builder.addCase(createTrip.fulfilled, (s, a) => { s.items.unshift(a.payload); });

    builder.addCase(updateTripStatus.fulfilled, (s, a) => {
      const i = s.items.findIndex(t => t.id === a.payload.id);
      if (i >= 0) s.items[i] = a.payload;
    });

    builder.addCase(updateTrip.fulfilled, (s, a) => {
      const i = s.items.findIndex(t => t.id === a.payload.id);
      if (i >= 0) s.items[i] = a.payload;
    });

    builder.addCase(deleteTrip.fulfilled, (s, a) => {
      s.items = s.items.filter(t => t.id !== a.payload);
    });
  }
});

export default tripsSlice.reducer;
