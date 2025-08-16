import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT, authorizeRoles, AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();
const router = express.Router();

// Create employee (HR only)
router.post("/", authenticateJWT, authorizeRoles("HR", "CEO"), async (req: AuthRequest, res) => {
  const { email, passwordHash, fullName, phone, departmentId, salary } = req.body;
  // In production: hash password and validate
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash, // implement hashing client or have backend hash
      fullName,
      phone,
      departmentId,
      salary,
      role: "EMPLOYEE",
    },
  });
  res.json(user);
});

// Get all employees (HR/CEO/HOD)
router.get("/", authenticateJWT, authorizeRoles("HR", "CEO", "HOD"), async (req: AuthRequest, res) => {
  const users = await prisma.user.findMany({
    include: { department: true },
  });
  res.json(users);
});

// Get single employee
router.get("/:id", authenticateJWT, authorizeRoles("HR", "CEO", "HOD", "EMPLOYEE"), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json(user);
});

export default router;