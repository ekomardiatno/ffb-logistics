import { sequelize } from "../src/db";
import "../src/models";
import { Driver, Mill, Vehicle } from "../src/models";

beforeAll(async () => {
  await sequelize.sync({ force: true });
  for (let i = 1; i <= 5; i++) {
    const d = await Driver.create({
      id: `driver-${i}`,
      name: `Driver ${i}`,
      licenseNumber: `LIC-${1000 + i}`,
      phoneNumber: `0812${100000 + i}`,
      status: "available"
    });
    await Vehicle.create({
      id: `vehicle-${i}`,
      plateNumber: `B-${1000 + i}`,
      type: i % 5 === 0 ? "dump_truck" : "truck",
      capacity: 12, // per assignment
      driverId: d.id,
      status: "idle"
    });
  }

  for (let i = 1; i <= 5; i++) {
    await Mill.create({
      id: `mill-${i}`,
      name: `Mill ${i}`,
      location: JSON.stringify({ lat: -2.9 + i * 0.01, lng: 110 + i * 0.01 }),
      contactPerson: `Contact ${i}`,
      phoneNumber: `081200${i}`,
      avgDailyProduction: 30 * 8 // 30 t/hr x 8 hr
    });
  }
});

afterAll(async () => {
  await sequelize.close();
});
