import { Driver } from "../../types";
import driversReducer, {
  fetchDrivers,
  createDriver,
  updateDriverStatus,
  DriversState,
} from "../driversSlice";
import { expect, describe, it } from "vitest";

describe("driversSlice", () => {
  const initial = { items: [], loading: false, error: null };

  it("should return initial state", () => {
    expect(driversReducer(undefined, { type: "" })).toEqual(initial);
  });

  it("should set loading on fetchDrivers.pending", () => {
    const state = driversReducer(initial, fetchDrivers.pending(""));
    expect(state.loading).toBe(true);
  });

  it("should set items on fetchDrivers.fulfilled", () => {
    const mockDrivers: Driver[] = [
      {
        id: "d1",
        name: "John",
        status: "available",
        licenseNumber: "",
        phoneNumber: "",
      },
    ];
    const state = driversReducer(
      initial,
      fetchDrivers.fulfilled(mockDrivers, "")
    );
    expect(state.items).toEqual(mockDrivers);
    expect(state.loading).toBe(false);
  });

  it("should update status on updateDriverStatus.fulfilled", () => {
    const state: DriversState = {
      items: [
        {
          id: "d1",
          name: "John",
          status: "available",
          licenseNumber: "",
          phoneNumber: "",
        },
      ],
      loading: false,
      error: null,
    };
    const updated = driversReducer(
      state,
      updateDriverStatus.fulfilled(
        {
          id: "d1",
          name: "John",
          status: "inactive",
          licenseNumber: "",
          phoneNumber: "",
        },
        "",
        { id: "d1", status: "inactive" }
      )
    );
    expect(updated.items[0].status).toBe("inactive");
  });

  it("should add new driver on createDriver.fulfilled", () => {
    const data: Driver = {
      id: "d1",
      name: "John",
      status: "available",
      licenseNumber: "",
      phoneNumber: "",
    };
    const createArg = {
      licenseNumber: data.licenseNumber,
      name: data.name,
      phoneNumber: data.phoneNumber,
      status: data.status,
    };
    const state = driversReducer(
      initial,
      createDriver.fulfilled(data, "", createArg)
    );
    expect(state.items[0]).toEqual(data);
  });
});
