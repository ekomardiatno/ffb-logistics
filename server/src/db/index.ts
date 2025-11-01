import { Sequelize } from "sequelize";
import path from "path";

const storagePath = process.env.SQLITE_FILE || path.join(__dirname, "../../data/database.sqlite");

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: false
});