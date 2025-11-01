import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

interface GeoLocation {
  lat: number;
  lng: number;
}

interface MillAttrs {
  id: string;
  name: string;
  location: string; // store as JSON
  contactPerson: string;
  phoneNumber: string;
  avgDailyProduction: number;
}

interface MillCreationAttrs extends Optional<MillAttrs, "id"> {}

class Mill extends Model<MillAttrs, MillCreationAttrs> implements MillAttrs {
  public id!: string;
  public name!: string;
  public location!: string;
  public contactPerson!: string;
  public phoneNumber!: string;
  public avgDailyProduction!: number;
}

Mill.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.TEXT, allowNull: false },
  contactPerson: { type: DataTypes.STRING, allowNull: false },
  phoneNumber: { type: DataTypes.STRING, allowNull: false },
  avgDailyProduction: { type: DataTypes.FLOAT, allowNull: false }
}, { sequelize, tableName: "mills" });

export default Mill;
