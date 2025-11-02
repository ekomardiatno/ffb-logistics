import app from "./app";
import { sequelize } from "./db";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true, force: true });
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

start();
