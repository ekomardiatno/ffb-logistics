import { Trip } from "../../types";
import tripsReducer, {
  fetchTrips,
  createTrip,
  updateTripStatus,
  TripsState,
} from "../tripsSlice";
import { describe, it, expect } from "vitest";

describe("Trips Slice", () => {
  const initial = { items: [], loading: false, error: null };

  it("should return initial state", () => {
    expect(tripsReducer(undefined, { type: "unknown" })).toEqual(initial);
  });

  it("should set loading on fetchTrips.pending", () => {
    const state = tripsReducer(initial, fetchTrips.pending(""));
    expect(state.loading).toBe(true);
    expect(state.error).toBe(null);
  });

  it("should set items on fetchTrips.fulfilled", () => {
    const mockTrips: Trip[] = [
      {
        id: "1",
        status: "scheduled",
        scheduledDate: "2025-01-01T00:00:00Z",
        driverId: "1",
        estimatedDuration: 120,
        vehicleId: "1",
      },
    ];
    const state = tripsReducer(initial, fetchTrips.fulfilled(mockTrips, ""));
    expect(state.items).toEqual(mockTrips);
    expect(state.loading).toBe(false);
  });

  it("should add trip on createTrip.fulfilled", () => {
    const newTrip: Trip = {
      id: "1",
      scheduledDate: "2025-01-01T00:00:00Z",
      driverId: "1",
      estimatedDuration: 120,
      vehicleId: "1",
      collections: [{
        id: '1',
        millId: "1",
        collected: 6,
        tripId: "1"
      }],
      status: "scheduled"
    };
    const createArg = {
      vehicleId: newTrip.vehicleId,
      driverId: newTrip.driverId,
      mills: newTrip.collections ? newTrip.collections.map(c => ({
        millId: c.millId,
        plannedCollection: c.collected
      })) : [],
      scheduledDate: newTrip.scheduledDate,
      estimatedDuration: newTrip.estimatedDuration,
    };
    const state = tripsReducer(
      initial,
      createTrip.fulfilled(newTrip, "", createArg)
    );
    expect(state.items[0]).toEqual(newTrip);
  });

  it("should update status on updateTripStatus.fulfilled", () => {
    const current: TripsState = {
      items: [{ id: "1", status: "scheduled", driverId: "1", estimatedDuration: 120, scheduledDate: '2025-10-11T03:00:12.000Z', vehicleId: "1" }],
      loading: false,
      error: null,
    };
    const state = tripsReducer(
      current,
      updateTripStatus.fulfilled({
        driverId: current.items[0]?.driverId,
        estimatedDuration: current.items[0]?.estimatedDuration,
        id: current.items[0]?.id,
        scheduledDate: current.items[0]?.scheduledDate,
        vehicleId: current.items[0]?.vehicleId,
        status: "completed"
      }, "", {
        id: "1",
        status: "completed",
      })
    );
    expect(state.items[0].status).toBe("completed");
  });
});
