import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/api";
import { Trip } from "../types";

export const fetchTrips = createAsyncThunk("trips/fetch", async () => {
  const res = await api.get<Trip[]>("/trips");
  return res.data;
});

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
  }
});

export default tripsSlice.reducer;
