import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

type TripStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

interface TripAttrs {
  id: string;
  vehicleId: string;
  driverId: string;
  scheduledDate: Date;
  status: TripStatus;
  estimatedDuration: number;
}

interface TripCreationAttrs extends Optional<TripAttrs, "id"> {}

class Trip extends Model<TripAttrs, TripCreationAttrs> implements TripAttrs {
  public id!: string;
  public vehicleId!: string;
  public driverId!: string;
  public scheduledDate!: Date;
  public status!: TripStatus;
  public estimatedDuration!: number;
}

Trip.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  vehicleId: { type: DataTypes.STRING, allowNull: false },
  driverId: { type: DataTypes.STRING, allowNull: false },
  scheduledDate: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "scheduled" },
  estimatedDuration: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 }
}, { sequelize, tableName: "trips" });

export default Trip;
