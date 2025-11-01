import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

export type VehicleStatus = "idle" | "on_trip" | "maintenance";

interface VehicleAttributes {
  id: string;
  plateNumber: string;
  type: string;
  capacity: number;
  driverId?: string | null;
  status: VehicleStatus;
}

interface VehicleCreationAttributes extends Optional<VehicleAttributes, "id" | "driverId"> {}

class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
  public id!: string;
  public plateNumber!: string;
  public type!: string;
  public capacity!: number;
  public driverId?: string | null;
  public status!: VehicleStatus;
}

Vehicle.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  plateNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  type: { type: DataTypes.STRING, allowNull: false },
  capacity: { type: DataTypes.FLOAT, allowNull: false },
  driverId: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "idle" }
}, { sequelize, tableName: "vehicles" });

export default Vehicle;
