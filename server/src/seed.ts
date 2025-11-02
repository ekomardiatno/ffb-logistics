import { v4 as uuidv4 } from "uuid";
import { sequelize } from "./db";
import { Vehicle, Driver, Mill, Trip, Collection } from "./models";

async function seed() {
  await sequelize.sync({ force: true });
  const drivers = [];
  const vehicles = [];
  for (let i = 1; i <= 20; i++) {
    const d = await Driver.create({
      id: uuidv4(),
      name: `Driver ${i}`,
      licenseNumber: `LIC-${1000 + i}`,
      phoneNumber: `0812${100000 + i}`,
      status: "available"
    });
    drivers.push(d.get());
    const v = await Vehicle.create({
      id: uuidv4(),
      plateNumber: `B-${1000 + i}`,
      type: i % 5 === 0 ? "dump_truck" : "truck",
      capacity: 12, // per assignment
      driverId: d.id,
      status: "idle"
    });
    vehicles.push(v);
  }

  const mills = [];
  for (let i = 1; i <= 30; i++) {
    const m = await Mill.create({
      id: uuidv4(),
      name: `Mill ${i}`,
      location: JSON.stringify({ lat: -2.9 + i * 0.01, lng: 110 + i * 0.01 }),
      contactPerson: `Contact ${i}`,
      phoneNumber: `081200${i}`,
      avgDailyProduction: 30 * 8 // 30 t/hr x 8 hr
    });
    mills.push(m);
  }

  // create trips
  for (let i = 0; i < 10000; i++) {
    const vehicle = vehicles[i % vehicles.length];
    const driver = drivers[i % drivers.length];
    const trip = await Trip.create({
      id: uuidv4(),
      vehicleId: vehicle.id,
      driverId: driver.id,
      scheduledDate: new Date(Date.now() - (i + 5) * 16 * 60 * 60 * 1000),
      status: "completed",
      estimatedDuration: 120
    });
    const numCollections = 1 + (i % 3);
    for (let j = 0; j < numCollections; j++) {
      await Collection.create({
        id: uuidv4(),
        tripId: trip.id,
        millId: mills[(i + j) % mills.length].id,
        collected: Math.min(6 + j * 2, 12)
      });
    }
  }

  console.log("Seed complete");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
