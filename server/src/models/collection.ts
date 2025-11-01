import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../db";

interface CollectionAttrs {
  id: string;
  tripId: string;
  millId: string;
  collected: number; // tons
}

interface CollectionCreationAttrs extends Optional<CollectionAttrs, "id"> {}

class Collection extends Model<CollectionAttrs, CollectionCreationAttrs> implements CollectionAttrs {
  public id!: string;
  public tripId!: string;
  public millId!: string;
  public collected!: number;
}

Collection.init({
  id: { type: DataTypes.STRING, primaryKey: true },
  tripId: { type: DataTypes.STRING, allowNull: false },
  millId: { type: DataTypes.STRING, allowNull: false },
  collected: { type: DataTypes.FLOAT, allowNull: false }
}, { sequelize, tableName: "collections" });

export default Collection;
