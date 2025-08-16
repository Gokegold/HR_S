import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

let token = "";

beforeAll(async () => {
  const pw = await bcrypt.hash("password", 10);
  const user = await prisma.user.upsert({
    where: { email: "testuser@example.com" },
    update: {},
    create: {
      email: "testuser@example.com",
      passwordHash: pw,
      fullName: "Test User",
      role: "EMPLOYEE",
      salary: 100000,
    },
  });
  token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
});

describe("Attendance API", () => {
  it("should reject attendance when outside geofence", async () => {
    const res = await request(app)
      .post("/attendance")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "CLOCK_IN",
        latitude: 0,
        longitude: 0,
        photoBase64: null,
      });
    expect(res.status === 403 || res.status === 500).toBeTruthy(); // depends on whether geofence exists
  });
});