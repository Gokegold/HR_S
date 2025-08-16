import express from "express";
import { PrismaClient, AttendanceType } from "@prisma/client";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { verifyGeofence } from "../services/geofence";
import { compareFaceWithReference, uploadImageToS3 } from "../services/rekognition";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * POST /attendance
 * body: { type, latitude, longitude, photoBase64 }
 */
router.post("/", authenticateJWT, async (req: AuthRequest, res) => {
  const { type, latitude, longitude, photoBase64 } = req.body;
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthenticated" });

  // find nearest active geofence (we use last created; you may adapt to user assignment)
  const geofence = await prisma.geofence.findFirst({ orderBy: { createdAt: "desc" } });
  if (!geofence) return res.status(500).json({ message: "No geofence configured. Contact CEO." });

  const inside = verifyGeofence(geofence.centerLat, geofence.centerLng, geofence.radiusMeters, latitude, longitude);
  if (!inside) return res.status(403).json({ message: "You are outside of the allowed geofence." });

  // handle photo
  let photoRef: string | null = null;
  if (photoBase64) {
    photoRef = await uploadImageToS3(user.id, photoBase64);
    // fetch enrolled selfie
    const profile = await prisma.employeeProfile.findUnique({ where: { userId: user.id } });
    if (!profile || !profile.selfieRef) {
      // first-time enrollment: store selfie as enrolled reference
      await prisma.employeeProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, selfieRef: photoRef },
        update: {},
      });
    } else {
      // compare faces
      const matched = await compareFaceWithReference(profile.selfieRef, photoRef);
      if (!matched) {
        // optionally allow fallback to WebAuthn if device supports and user enrolled
        return res.status(403).json({ message: "Face verification failed" });
      }
    }
  }

  const attendance = await prisma.attendance.create({
    data: {
      userId: user.id,
      type: type as AttendanceType,
      latitude,
      longitude,
      photoRef,
      geofenceId: geofence.id,
    },
  });

  return res.json({ ok: true, attendance });
});

router.get("/me", authenticateJWT, async (req: AuthRequest, res) => {
  const logs = await prisma.attendance.findMany({
    where: { userId: req.user.id },
    orderBy: { timestamp: "desc" },
    take: 200,
  });
  res.json(logs);
});

export default router;