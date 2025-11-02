import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/api";
import { Mill } from "../types";

export const fetchMills = createAsyncThunk("mills/fetch", async () => {
  const res = await api.get<Mill[]>("/mills");
  return res.data;
});

interface MillsState {
  items: Mill[];
  loading: boolean;
  error?: string | null;
}

const initialState: MillsState = { items: [], loading: false, error: null };

const millsSlice = createSlice({
  name: "mills",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMills.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMills.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchMills.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to load mills";
    });
  }
});

export default millsSlice.reducer;
