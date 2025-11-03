import request from "supertest";
import app from "../src/app";

describe("Trips routes (more)", () => {
  it("POST /api/trips > should create a trip", async () => {
    const res = await request(app)
      .post("/api/trips")
      .send({
        vehicleId: "vehicle-1",
        driverId: "driver-1",
        scheduledDate: new Date().toISOString(),
        estimatedDuration: 60,
        mills: [
          {
            millId: "mill-1",
            plannedCollection: 12,
          },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it("GET /api/trips > returns list", async () => {
    const res = await request(app).get("/api/trips");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/trips > returns 400 when planned collections exceed vehicle capacity", async () => {
    const res = await request(app)
      .post("/api/trips")
      .send({
        vehicleId: "vehicle-2",
        driverId: "driver-2",
        scheduledDate: new Date().toISOString(),
        estimatedDuration: 60,
        mills: [{ millId: "mill-1", plannedCollection: 20 }],
      });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Planned collections exceed vehicle capacity"
    );
  });

  it("POST /api/trips > returns 500 when driver is not available", async () => {
    // set driver-5 to on_trip first
    const set = await request(app)
      .put(`/api/drivers/driver-5`)
      .send({ status: "on_trip" });
    expect(set.status).toBe(200);

    const res = await request(app)
      .post("/api/trips")
      .send({
        vehicleId: "vehicle-5",
        driverId: "driver-5",
        scheduledDate: new Date().toISOString(),
        estimatedDuration: 60,
        mills: [{ millId: "mill-1", plannedCollection: 5 }],
      });
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Driver is not available");
  });

  it("PATCH /api/trips/:id/status > completed releases driver and vehicle", async () => {
    const create = await request(app)
      .post("/api/trips")
      .send({
        vehicleId: "vehicle-3",
        driverId: "driver-3",
        scheduledDate: new Date().toISOString(),
        estimatedDuration: 60,
        mills: [{ millId: "mill-2", plannedCollection: 5 }],
      });
    expect(create.status).toBe(201);
    const id = create.body.id;

    // trip creation should have set vehicle and driver to on_trip
    const patch = await request(app)
      .patch(`/api/trips/${id}/status`)
      .send({ status: "completed" });
    expect(patch.status).toBe(200);
    expect(patch.body.status).toBe("completed");

    // driver should be available and vehicle idle
    const drivers = await request(app).get("/api/drivers");
    const d = drivers.body.find((x: any) => x.id === "driver-3");
    expect(d.status).toBe("available");

    const vehicles = await request(app).get("/api/vehicles");
    const v = vehicles.body.find((x: any) => x.id === "vehicle-3");
    expect(v.status).toBe("idle");
  });

  it("PUT /api/trips/:id > updates mills collections", async () => {
    const create = await request(app)
      .post("/api/trips")
      .send({
        vehicleId: "vehicle-4",
        driverId: "driver-4",
        scheduledDate: new Date().toISOString(),
        estimatedDuration: 60,
        mills: [{ millId: "mill-3", plannedCollection: 3 }],
      });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const res = await request(app)
      .put(`/api/trips/${id}`)
      .send({
        mills: [{ millId: "mill-4", plannedCollection: 7 }],
        estimatedDuration: 90,
      });
    expect(res.status).toBe(200);
    expect(res.body.collections).toBeDefined();
    expect(res.body.collections.some((c: any) => c.millId === "mill-4")).toBe(
      true
    );
    expect(res.body.estimatedDuration).toBe(90);
  });

  it("DELETE /api/trips/:id > deletes trip and returns 404 afterwards", async () => {
    const create = await request(app)
      .post("/api/trips")
      .send({
        vehicleId: "vehicle-2",
        driverId: "driver-2",
        scheduledDate: new Date().toISOString(),
        estimatedDuration: 60,
        mills: [{ millId: "mill-1", plannedCollection: 1 }],
      });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const del = await request(app).delete(`/api/trips/${id}`);
    expect(del.status).toBe(200);
    expect(del.body).toEqual({ success: true });

    const del2 = await request(app).delete(`/api/trips/${id}`);
    expect(del2.status).toBe(404);
  });
});
