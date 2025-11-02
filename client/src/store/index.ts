import { configureStore } from "@reduxjs/toolkit";
import vehiclesReducer from "./vehiclesSlice";
import driversReducer from "./driversSlice";
import millsReducer from "./millsSlice";
import tripsReducer from "./tripsSlice";

export const store = configureStore({
  reducer: {
    vehicles: vehiclesReducer,
    drivers: driversReducer,
    mills: millsReducer,
    trips: tripsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
