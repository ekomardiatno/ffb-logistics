import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

export type DriverStatus = "available" | "on_trip" | "inactive";

interface DriverAttrs {
  id: string;
  name: string;
  licenseNumber: string;
  phoneNumber: string;
  status: DriverStatus;
}

interface DriverCreationAttrs extends Optional<DriverAttrs, "id"> {}

class Driver extends Model<DriverAttrs, DriverCreationAttrs> implements DriverAttrs {
  public id!: string;
  public name!: string;
  public licenseNumber!: string;
  public phoneNumber!: string;
  public status!: DriverStatus;
}

Driver.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  licenseNumber: { type: DataTypes.STRING, allowNull: false },
  phoneNumber: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: "available" }
}, { sequelize, tableName: "drivers" });

export default Driver;
