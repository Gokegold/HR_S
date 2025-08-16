import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./controllers/auth";
import employeeRoutes from "./controllers/employees";
import attendanceRoutes from "./controllers/attendance";
import geofenceRoutes from "./controllers/geofence";
import payrollRoutes from "./controllers/payroll";
import penaltyRoutes from "./controllers/penalty";
import webauthnRoutes from "./controllers/webauthn";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/geofence", geofenceRoutes);
app.use("/payroll", payrollRoutes);
app.use("/penalties", penaltyRoutes);
app.use("/webauthn", webauthnRoutes);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

export default app;