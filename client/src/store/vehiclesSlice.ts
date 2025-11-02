import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/api";
import { Vehicle } from "../types";

export const fetchVehicles = createAsyncThunk("vehicles/fetch", async () => {
  const res = await api.get<Vehicle[]>("/vehicles");
  return res.data;
});

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
  }
});

export default vehiclesSlice.reducer;
