import express from "express";
import cors from "cors";
import vehiclesRouter from "./routes/vehicles";
import driversRouter from "./routes/drivers";
import millsRouter from "./routes/mills";
import tripsRouter from "./routes/trips";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/vehicles", vehiclesRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/mills", millsRouter);
app.use("/api/trips", tripsRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// simple error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: err.message || "internal error" });
});

export default app;
