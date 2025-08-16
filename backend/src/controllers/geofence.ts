import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT, authorizeRoles, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", authenticateJWT, authorizeRoles("CEO"), async (req: AuthRequest, res) => {
  const { name, centerLat, centerLng, radiusMeters } = req.body;
  const geo = await prisma.geofence.create({
    data: { name, centerLat, centerLng, radiusMeters, createdBy: req.user.id },
  });
  res.json(geo);
});

router.get("/", authenticateJWT, authorizeRoles("CEO", "HR", "HOD"), async (_req, res) => {
  const geos = await prisma.geofence.findMany({ orderBy: { createdAt: "desc" } });
  res.json(geos);
});

router.put("/:id", authenticateJWT, authorizeRoles("CEO"), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { centerLat, centerLng, radiusMeters, name } = req.body;
  const geo = await prisma.geofence.update({
    where: { id },
    data: { centerLat, centerLng, radiusMeters, name },
  });
  res.json(geo);
});

export default router;