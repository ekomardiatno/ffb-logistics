import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/api";
import { Driver } from "../types";

export const fetchDrivers = createAsyncThunk("drivers/fetch", async () => {
  const res = await api.get<Driver[]>("/drivers");
  return res.data;
});
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
  }
});

export default driversSlice.reducer;
