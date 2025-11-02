import { sequelize } from "./db";

async function sync() {
  await sequelize.sync({ alter: true });
}

sync().catch(err => {
  console.error(err);
  process.exit(1);
});
