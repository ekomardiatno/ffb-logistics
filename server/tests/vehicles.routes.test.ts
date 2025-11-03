import request from "supertest";
import app from "../src/app";

describe("Vehicles API", () => {
  it("GET /api/vehicles > returns vehicles with driver included", async () => {
    const res = await request(app).get("/api/vehicles");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) expect(res.body[0]).toHaveProperty("driver");
  });

  it("POST /api/vehicles > creates vehicle with valid payload", async () => {
    const payload = {
      plateNumber: "PLATE-123",
      type: "truck",
      capacity: 10,
      driverId: "driver-1",
    };
    const res = await request(app).post("/api/vehicles").send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.plateNumber).toBe(payload.plateNumber);
  });

  it("POST /api/vehicles > returns 400 for invalid payload", async () => {
    const res = await request(app).post("/api/vehicles").send({
      plateNumber: "X",
      type: "t",
      capacity: 0,
      driverId: "d",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation error");
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it("PUT /api/vehicles/:id > updates vehicle fields", async () => {
    const create = await request(app).post("/api/vehicles").send({
      plateNumber: "PLATE-999",
      type: "truck",
      capacity: 8,
      driverId: "driver-2",
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const res = await request(app).put(`/api/vehicles/${id}`).send({ plateNumber: "PLATE-998", capacity: 12 });
    expect(res.status).toBe(200);
    expect(res.body.plateNumber).toBe("PLATE-998");
    expect(res.body.capacity).toBe(12);
  });

  it("DELETE /api/vehicles/:id > deletes vehicle and subsequent 404", async () => {
    const create = await request(app).post("/api/vehicles").send({
      plateNumber: "PLATE-DEL",
      type: "truck",
      capacity: 5,
      driverId: "driver-3",
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const del = await request(app).delete(`/api/vehicles/${id}`);
    expect(del.status).toBe(200);
    expect(del.body).toEqual({ success: true });

    const del2 = await request(app).delete(`/api/vehicles/${id}`);
    expect(del2.status).toBe(404);
  });

  it("PATCH /api/vehicles/:id/status > errors when vehicle has active last trip", async () => {
    // create vehicle and set to on_trip then create a trip with scheduled status
    const create = await request(app).post("/api/vehicles").send({
      plateNumber: "PLATE-TRIP",
      type: "truck",
      capacity: 10,
      driverId: "driver-4",
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const set = await request(app).put(`/api/vehicles/${id}`).send({});
    // update the status by creating a trip which will set status to on_trip via trip creation
    const tripCreate = await request(app).post("/api/trips").send({
      vehicleId: id,
      driverId: "driver-4",
      scheduledDate: new Date().toISOString(),
      estimatedDuration: 30,
      mills: [{ millId: "mill-1", plannedCollection: 1 }],
    });
    expect(tripCreate.status).toBe(201);

    const res = await request(app).patch(`/api/vehicles/${id}/status`).send({ status: "idle" });
    // route throws an error leading to 500 in handler
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
  });

  it("PATCH /api/vehicles/:id/assign-driver > assigns and unassigns driver; returns 400 for missing driver", async () => {
    const create = await request(app).post("/api/vehicles").send({
      plateNumber: "PLATE-ASSIGN",
      type: "truck",
      capacity: 11,
      driverId: "driver-1",
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const assign = await request(app).patch(`/api/vehicles/${id}/assign-driver`).send({ driverId: "driver-2" });
    expect(assign.status).toBe(200);
    expect(assign.body.driver).toBeDefined();

    const unassign = await request(app).patch(`/api/vehicles/${id}/assign-driver`).send({ driverId: null });
    expect(unassign.status).toBe(200);
    expect(unassign.body.driver).toBeNull();

    const bad = await request(app).patch(`/api/vehicles/${id}/assign-driver`).send({ driverId: "nope" });
    expect(bad.status).toBe(400);
    expect(bad.body).toHaveProperty("error", "Driver not found");
  });
});
