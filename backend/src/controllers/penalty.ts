import express from "express";
import { PrismaClient, PenaltyType } from "@prisma/client";
import { authenticateJWT, authorizeRoles, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = express.Router();

// HR/CEO create penalty
router.post("/", authenticateJWT, authorizeRoles("HR", "CEO"), async (req: AuthRequest, res) => {
  const { userId, type, amount, reason } = req.body;
  if (!userId || !type || !amount) return res.status(400).json({ message: "Missing fields" });

  const penalty = await prisma.penalty.create({
    data: {
      userId,
      type: type as PenaltyType,
      amount,
      reason: reason || "",
      active: true,
    },
  });

  res.json({ ok: true, penalty });
});

// list penalties (HR/CEO/HOD can view)
router.get("/", authenticateJWT, authorizeRoles("HR", "CEO", "HOD"), async (_req, res) => {
  const penalties = await prisma.penalty.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  res.json(penalties);
});

// resolve / toggle active (HR/CEO)
router.put("/:id/resolve", authenticateJWT, authorizeRoles("HR", "CEO"), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const penalty = await prisma.penalty.update({ where: { id }, data: { active: false } });
  res.json({ ok: true, penalty });
});

export default router;