import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Driver, Vehicle } from "../models";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const vehicles = await Vehicle.findAll({ include: "driver" });
    res.json(vehicles);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const { plateNumber, type, capacity, driverId } = req.body;
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
    await vehicle.update(req.body);
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
