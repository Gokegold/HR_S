import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT, authorizeRoles } from "../middleware/auth";
import { Parser } from "json2csv";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/generate", authenticateJWT, authorizeRoles("HR", "CEO"), async (req, res) => {
  const { month, year } = req.body;
  const users = await prisma.user.findMany({ where: { role: "EMPLOYEE" } });
  const results = [];

  for (const u of users) {
    const penalties = await prisma.penalty.findMany({ where: { userId: u.id, active: true } });
    const deductions = penalties.reduce((s, p) => s + p.amount, 0);
    const base = u.salary;
    const net = base - deductions;
    const payroll = await prisma.payroll.create({
      data: {
        userId: u.id,
        month,
        year,
        baseSalary: base,
        deductions,
        netPay: net,
      },
    });
    results.push({ ...payroll, userEmail: u.email, userFullName: u.fullName });
  }

  res.json({ ok: true, generated: results.length, results });
});

router.get("/export", authenticateJWT, authorizeRoles("HR", "CEO"), async (req, res) => {
  const { month, year } = req.query;
  const payrolls = await prisma.payroll.findMany({
    where: { month: Number(month), year: Number(year) },
    include: { user: true },
  });
  const csv = new Parser({
    fields: ["user.email", "user.fullName", "month", "year", "baseSalary", "deductions", "netPay"],
  }).parse(payrolls as any);
  res.header("Content-Type", "text/csv");
  res.attachment(`payroll_${month}_${year}.csv`);
  res.send(csv);
});

router.get("/", authenticateJWT, authorizeRoles("HR", "CEO", "HOD"), async (_req, res) => {
  const payrolls = await prisma.payroll.findMany({ orderBy: { generatedAt: "desc" }, include: { user: true } });
  res.json(payrolls);
});

export default router;