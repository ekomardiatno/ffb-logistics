import express from "express";
import { v4 as uuidv4 } from "uuid";
import { Trip, Vehicle, Collection, Driver } from "../models";
import { sequelize } from "../db";
import { CreateTripDto, UpdateTripDto } from "../dto/trips";

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
      CreateTripDto.parse(req.body);
    // mills: [{ millId, plannedCollection }]
    // capacity check
    const vehicle = await Vehicle.findByPk(vehicleId);
    const driver = await Driver.findByPk(driverId);

    if (!driver) throw new Error("Driver not found");
    if (!vehicle) throw new Error("Vehicle not found");
    if (driver.status !== "available")
      throw new Error("Driver is not available");
    if (vehicle.status !== "idle") throw new Error("Vehicle is not idle");
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
        estimatedDuration:
          typeof estimatedDuration === "string"
            ? Number(estimatedDuration)
            : estimatedDuration || 60,
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

    await vehicle.update({ status: "on_trip" }, { transaction: t });
    await driver.update(
      { status: "on_trip" },
      {
        transaction: t,
      }
    );

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

// update trip status
router.patch("/:id/status", async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    const status = req.body.status as Trip["status"];
    if (status === "cancelled" || status === "completed") {
      await Driver.update(
        { status: "available" },
        {
          where: {
            id: trip.driverId,
          },
          transaction: t,
        }
      );
      await Vehicle.update(
        { status: "idle" },
        {
          where: {
            id: trip.vehicleId,
          },
          transaction: t,
        }
      );
    }
    await trip.update(
      { status: req.body.status },
      {
        transaction: t,
      }
    );
    await t.commit();
    res.json(trip);
  } catch (err) {
    await t.rollback();
    next(err);
  }
});

// edit trip (date, duration, mills collections)
router.put("/:id", async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { scheduledDate, estimatedDuration, mills } = UpdateTripDto.parse(
      req.body
    );
    const trip = await Trip.findByPk(req.params.id, { transaction: t });
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (scheduledDate || estimatedDuration) {
      await trip.update(
        {
          ...(scheduledDate
            ? {
                scheduledDate:
                  typeof scheduledDate === "string"
                    ? new Date(scheduledDate)
                    : scheduledDate,
              }
            : {}),
          ...(estimatedDuration
            ? {
                estimatedDuration:
                  typeof estimatedDuration === "string"
                    ? Number(estimatedDuration)
                    : estimatedDuration,
              }
            : {}),
        },
        { transaction: t }
      );
    }

    if (Array.isArray(mills)) {
      // replace collections
      await Collection.destroy({ where: { tripId: trip.id }, transaction: t });
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
    }

    await t.commit();
    const updated = await Trip.findByPk(trip.id, {
      include: [
        "vehicle",
        "driver",
        { model: Collection, as: "collections", include: ["mill"] },
      ],
    });
    res.json(updated);
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
    const lastTripDriver = await Trip.findOne({
      where: {
        driverId: trip.driverId,
        status: ["in_progress", "scheduled"],
      },
      order: [["scheduledDate", "DESC"]],
    });
    const lastTripVehicle = await Trip.findOne({
      where: {
        vehicleId: trip.vehicleId,
        status: ["in_progress", "scheduled"],
      },
      order: [["scheduledDate", "DESC"]],
    });
    if (
      (trip.status === "in_progress" || trip.status === "scheduled") &&
      lastTripDriver?.id === trip.id
    ) {
      await Driver.update(
        { status: "available" },
        {
          where: {
            id: trip.driverId,
          },
          transaction: t,
        }
      );
    }
    if (
      (trip.status === "in_progress" || trip.status === "scheduled") &&
      lastTripVehicle?.id === trip.id
    ) {
      await Vehicle.update(
        { status: "idle" },
        {
          where: {
            id: trip.vehicleId,
          },
          transaction: t,
        }
      );
    }
    await trip.destroy({ transaction: t });
    await t.commit();
    res.json({ success: true });
  } catch (err) {
    await t.rollback();
    next(err);
  }
});

export default router;
