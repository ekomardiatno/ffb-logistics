import request from "supertest";
import app from "../src/app";
import { Trip } from "../src/models";

describe("Drivers routes (additional)", () => {
  it("GET /api/drivers > returns drivers with vehicles", async () => {
    const res = await request(app).get("/api/drivers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // setup.ts creates 5 drivers
    expect(res.body.length).toBeGreaterThanOrEqual(5);
    // each driver should include vehicles array (may be empty)
    expect(res.body[0]).toHaveProperty("vehicles");
  });

  it("PUT /api/drivers/:id > updates driver fields", async () => {
    // create a new driver so we don't interfere with seeded ones
    const create = await request(app).post("/api/drivers").send({
      name: "Put Test",
      licenseNumber: "PUT-01",
      phoneNumber: "0812999001",
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const res = await request(app).put(`/api/drivers/${id}`).send({ name: "Updated Name" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Name");
  });

  it("DELETE /api/drivers/:id > deletes driver", async () => {
    const create = await request(app).post("/api/drivers").send({
      name: "Delete Test",
      licenseNumber: "DEL-01",
      phoneNumber: "0812999002",
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const del = await request(app).delete(`/api/drivers/${id}`);
    expect(del.status).toBe(200);
    expect(del.body).toEqual({ success: true });

    // subsequent update should return 404
    const put = await request(app).put(`/api/drivers/${id}`).send({ name: "Nope" });
    expect(put.status).toBe(404);
  });

  it("PATCH /api/drivers/:id/status > errors when driver has an in-progress or scheduled last trip", async () => {
    const create = await request(app).post("/api/drivers").send({
      name: "Trip Lock",
      licenseNumber: "LOCK01",
      phoneNumber: "0812999003",
    });
    expect(create.status).toBe(201);
    const id = create.body.id;
    // set the driver status to on_trip so the route's condition triggers for in_progress
    const setOnTrip = await request(app).put(`/api/drivers/${id}`).send({ status: "on_trip" });
    expect(setOnTrip.status).toBe(200);

    // create a trip for this driver with status in_progress
    await Trip.create({
      id: `trip-lock-${Date.now()}`,
      vehicleId: "vehicle-1",
      driverId: id,
      scheduledDate: new Date(),
      status: "in_progress",
      estimatedDuration: 30,
    } as any);

    const res = await request(app).patch(`/api/drivers/${id}/status`).send({ status: "inactive" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual(expect.objectContaining({ error: "Driver is on trip" }));
  });

  it("PATCH /api/drivers/:id/status > allows status change when no active last trip", async () => {
    const create = await request(app).post("/api/drivers").send({
      name: "Status OK",
      licenseNumber: "OK-01",
      phoneNumber: "0812999004",
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const res = await request(app).patch(`/api/drivers/${id}/status`).send({ status: "inactive" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("inactive");
  });

  it("POST /drivers > create driver", async () => {
    const res = await request(app).post("/api/drivers").send({
      name: "John Doe",
      licenseNumber: "A1234",
      phoneNumber: "08123456781",
      status: "available",
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("John Doe");
  });

  it("POST /drivers > create driver with validation error", async () => {
    const res = await request(app).post("/api/drivers").send({
      name: "John Doe",
      licenseNumber: "A1234",
      phoneNumber: "08123",
      status: "available",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/validation error/i);
  });
});
