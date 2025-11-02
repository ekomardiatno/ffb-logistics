import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Driver, Trip, Vehicle } from "../models";
import { CreateVehicleDto, UpdateVehicleDto } from "../dto/vehicles";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const vehicles = await Vehicle.findAll({ include: "driver" });
    res.json(vehicles);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const { plateNumber, type, capacity, driverId } = CreateVehicleDto.parse(req.body);
    const vehicle = await Vehicle.create({
      id: uuidv4(),
      plateNumber,
      type,
      capacity,
      driverId,
      status: "idle"
    });
    res.status(201).json(vehicle);
  } catch (err) { next(err); }
});
router.put("/:id", async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    const { plateNumber, type, capacity, driverId } = UpdateVehicleDto.parse(req.body);
    const data: Partial<Vehicle> = {};
    if(plateNumber !== undefined) data.plateNumber = plateNumber;
    if(type !== undefined) data.type = type;
    if(capacity !== undefined) data.capacity = capacity;
    if(driverId !== undefined) data.driverId = driverId;
    await vehicle.update(data);
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    await vehicle.destroy();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// set vehicle status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const v = await Vehicle.findByPk(req.params.id);
    const lastTrip = await Trip.findOne({
      where: {
        vehicleId: req.params.id
      },
      order: [[ 'scheduledDate', 'DESC' ]]
    })
    if (!v) return res.status(404).json({ error: "Vehicle not found" });
    const status = req.body.status as Vehicle['status'];
    if(v.status === 'on_trip' && lastTrip?.status === 'in_progress' || lastTrip?.status === 'scheduled') throw new Error('Vehicle is on trip');
    await v.update({ status });
    res.json(v);
  } catch (err) { next(err); }
});

// assign or unassign driver
router.patch("/:id/assign-driver", async (req, res, next) => {
  try {
    const v = await Vehicle.findByPk(req.params.id);
    if (!v) return res.status(404).json({ error: "Vehicle not found" });
    const { driverId } = req.body; // may be null to unassign
    if (driverId) {
      const d = await Driver.findByPk(driverId);
      if (!d) return res.status(400).json({ error: "Driver not found" });
    }
    await v.update({ driverId: driverId ?? null });
    const withDriver = await Vehicle.findByPk(v.id, { include: "driver" });
    res.json(withDriver);
  } catch (err) { next(err); }
});

export default router;
