import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Mill } from "../models";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const mills = await Mill.findAll();
    res.json(mills);
  } catch (err) { next(err); }
});

router.post("/", async (req, res, next) => {
  try {
    const { avgDailyProduction, contactPerson, phoneNumber, location, name } = req.body;
    const mill = await Mill.create({
      id: uuidv4(),
      avgDailyProduction,
      contactPerson,
      phoneNumber,
      location: JSON.stringify(location),
      name
    });
    res.status(201).json(mill);
  } catch (err) { next(err); }
});

// Update mill
router.put("/:id", async (req, res, next) => {
  try {
    const mill = await Mill.findByPk(req.params.id);
    if (!mill) return res.status(404).json({ error: "Mill not found" });
    const updateData = { ...req.body };
    if (updateData.location && typeof updateData.location !== "string") {
      updateData.location = JSON.stringify(updateData.location);
    }
    await mill.update(updateData);
    res.json(mill);
  } catch (err) {
    next(err);
  }
});

// Delete mill
router.delete("/:id", async (req, res, next) => {
  try {
    const mill = await Mill.findByPk(req.params.id);
    if (!mill) return res.status(404).json({ error: "Mill not found" });
    await mill.destroy();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
