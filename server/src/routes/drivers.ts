import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Driver, Trip } from "../models";
import { CreateDriverDto, UpdateDriverDto } from "../dto/drivers";

const router = express.Router();

router.get("/", async (req, res, next) => {
  const drivers = await Driver.findAll({ include: "vehicles" });
  res.json(drivers);
});

router.post("/", async (req, res, next) => {
  try {
    const { licenseNumber, name, phoneNumber, status } = CreateDriverDto.parse(
      req.body
    );
    const driver = await Driver.create({
      id: uuidv4(),
      licenseNumber,
      name,
      phoneNumber,
      status: status ?? "available",
    });
    res.status(201).json(driver);
  } catch (err) {
    next(err);
  }
});

// Update driver
router.put("/:id", async (req, res, next) => {
  try {
    const { licenseNumber, name, phoneNumber, status } = UpdateDriverDto.parse(
      req.body
    );
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    const data: Partial<Driver> = {};
    if (licenseNumber !== undefined) data.licenseNumber = licenseNumber;
    if (name !== undefined) data.name = name;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (status !== undefined) data.status = status;
    await driver.update(data);
    res.json(driver);
  } catch (err) {
    next(err);
  }
});

// Delete driver
router.delete("/:id", async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    await driver.destroy();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// set availability/status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const d = await Driver.findByPk(req.params.id);
    const lastTrip = await Trip.findOne({
      where: {
        driverId: req.params.id,
      },
      order: [["scheduledDate", "DESC"]],
    });
    if (!d) return res.status(404).json({ error: "Driver not found" });
    const status = req.body.status as Driver["status"];
    if (
      (d.status === "on_trip" && lastTrip?.status === "in_progress") ||
      lastTrip?.status === "scheduled"
    )
      throw new Error("Driver is on trip");
    await d.update({ status });
    res.json(d);
  } catch (e) {
    next(e);
  }
});

export default router;
