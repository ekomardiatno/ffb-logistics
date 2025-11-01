import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Driver } from "../models";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const drivers = await Driver.findAll({ include: "vehicles" });
    res.json(drivers);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const { licenseNumber, name, phoneNumber } = req.body;
    const driver = await Driver.create({
      id: uuidv4(),
      licenseNumber,
      name,
      phoneNumber,
      status: "available"
    });
    res.status(201).json(driver);
  } catch (err) { next(err); }
});

// Update driver
router.put("/:id", async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    await driver.update(req.body);
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

export default router;
