import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/api";
import { Mill } from "../types";

export const fetchMills = createAsyncThunk("mills/fetch", async () => {
  const res = await api.get<Mill[]>("/mills");
  return res.data;
});

export const createMill = createAsyncThunk("mills/create", async (data: Omit<Mill, "id">, { rejectWithValue }) => {
  try {
    const res = await api.post("/mills", data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err)
  }
});

export const updateMill = createAsyncThunk(
  "mills/update",
  async ({ id, data }: { id: string; data: Partial<Mill> }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/mills/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err)
    }
  }
);

export interface MillsState {
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
    builder.addCase(createMill.fulfilled, (s, a) => { s.items.push(a.payload); });
    builder.addCase(updateMill.fulfilled, (s, a) => {
      const i = s.items.findIndex(m => m.id === a.payload.id);
      if (i >= 0) s.items[i] = a.payload;
    });
  }
});

export default millsSlice.reducer;
