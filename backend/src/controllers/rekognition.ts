import express from "express";
import { uploadImageToS3, compareTwoImages } from "../services/rekognition";
import { authenticateJWT } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * POST /rekognition/liveness
 * body: { imageA: base64, imageB: base64 }
 * -> uploads both images to S3, compares them, returns similarity and a pass/fail heuristic
 */
router.post("/liveness", authenticateJWT, async (req: any, res) => {
  const { imageA, imageB } = req.body;
  if (!imageA || !imageB) return res.status(400).json({ message: "Missing images" });

  const aKey = await uploadImageToS3(req.user.id, imageA);
  const bKey = await uploadImageToS3(req.user.id, imageB);

  const similarity = await compareTwoImages(aKey, bKey);
  // simple heuristic: if two images are similar but not identical (strictly < 99), treat as live
  const isLive = similarity > 60 && similarity < 99.5;

  res.json({ ok: true, similarity, isLive, aKey, bKey });
});

export default router;