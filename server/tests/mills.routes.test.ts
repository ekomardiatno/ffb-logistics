import request from "supertest";
import app from "../src/app";

describe("Mills API", () => {
  it("GET /api/mills > returns mills array", async () => {
    const res = await request(app).get("/api/mills");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/mills > creates a mill with valid payload", async () => {
    const payload = {
      name: "Test Mill",
      location: { lat: -2.5, lng: 110.0 },
      contactPerson: "Alice",
      phoneNumber: "08123456789",
      avgDailyProduction: 100,
    };
    const res = await request(app).post("/api/mills").send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(payload.name);
  });

  it("POST /api/mills > returns 400 for invalid payload", async () => {
    // avgDailyProduction must be >=1 and phoneNumber min length 10
    const res = await request(app).post("/api/mills").send({
      name: "X",
      location: { lat: "no", lng: 110 },
      contactPerson: "A",
      phoneNumber: "123",
      avgDailyProduction: 0,
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Validation error");
    expect(Array.isArray(res.body.details)).toBe(true);
  });

  it("PUT /api/mills/:id > updates an existing mill", async () => {
    const create = await request(app).post("/api/mills").send({
      name: "Updatable Mill",
      location: { lat: -2.6, lng: 110.1 },
      contactPerson: "Bob",
      phoneNumber: "08123456780",
      avgDailyProduction: 50,
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const res = await request(app).put(`/api/mills/${id}`).send({ name: "Updated Mill", phoneNumber: "08123456781", avgDailyProduction: 35, contactPerson: 'Ryan', location: { lat: 5.12, lng: 90.2 }  });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Updated Mill");
    expect(res.body.phoneNumber).toBe("08123456781");
    expect(res.body.avgDailyProduction).toBe(35)
    expect(res.body.contactPerson).toBe("Ryan")
    expect(res.body.location).toMatch(/5.12/i)
    expect(res.body.location).toMatch(/90.2/i)
  });

  it("PUT /api/mills/:id > attempt to update unexisted item", async () => {
    const res = await request(app).put(`/api/mills/non-existed`).send({ name: "Updated Mill", phoneNumber: "08123456781" });
    expect(res.status).toBe(404);
  });

  it("DELETE /api/mills/:id > deletes mill and subsequent 404 on delete", async () => {
    const create = await request(app).post("/api/mills").send({
      name: "Delete Mill",
      location: { lat: -2.7, lng: 110.2 },
      contactPerson: "Carol",
      phoneNumber: "08123456782",
      avgDailyProduction: 60,
    });
    expect(create.status).toBe(201);
    const id = create.body.id;

    const del = await request(app).delete(`/api/mills/${id}`);
    expect(del.status).toBe(200);
    expect(del.body).toEqual({ success: true });

    // deleting again should return 404
    const del2 = await request(app).delete(`/api/mills/${id}`);
    expect(del2.status).toBe(404);
  });
});
