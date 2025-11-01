import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Trip, Vehicle, Collection } from "../models";
import { sequelize } from "../db";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const trips = await Trip.findAll({
      include: [
        "vehicle",
        "driver",
        { model: Collection, as: "collections", include: ["mill"] },
      ],
    });
    res.json(trips);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { vehicleId, driverId, mills, scheduledDate, estimatedDuration } =
      req.body;
    // mills: [{ millId, plannedCollection }]
    // capacity check
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) throw new Error("Vehicle not found");
    const totalPlanned = mills.reduce(
      (s: number, m: any) => s + Number(m.plannedCollection || 0),
      0
    );
    if (totalPlanned > vehicle.capacity) {
      return res
        .status(400)
        .json({ error: "Planned collections exceed vehicle capacity" });
    }
    const trip = await Trip.create(
      {
        id: uuidv4(),
        vehicleId,
        driverId,
        scheduledDate: new Date(scheduledDate),
        estimatedDuration: estimatedDuration || 60,
        status: "scheduled",
      },
      { transaction: t }
    );

    // create collections
    for (const m of mills) {
      await Collection.create(
        {
          id: uuidv4(),
          tripId: trip.id,
          millId: m.millId,
          collected: Number(m.plannedCollection || 0),
        },
        { transaction: t }
      );
    }

    // mark vehicle and driver on_trip (simple)
    await vehicle.update({ status: "on_trip" }, { transaction: t });

    await t.commit();
    const created = await Trip.findByPk(trip.id, {
      include: [
        "vehicle",
        "driver",
        { model: Collection, as: "collections", include: ["mill"] },
      ],
    });
    res.status(201).json(created);
  } catch (err) {
    await t.rollback();
    next(err);
  }
});
router.delete("/:id", async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const trip = await Trip.findByPk(req.params.id, { transaction: t });
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    await Collection.destroy({ where: { tripId: trip.id }, transaction: t });
    await trip.destroy({ transaction: t });
    await t.commit();
    res.json({ success: true });
  } catch (err) {
    await t.rollback();
    next(err);
  }
});

export default router;
