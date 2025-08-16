// extended seed to ensure at least one geofence and demo penalty
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash("password", 10);

  const ceo = await prisma.user.upsert({
    where: { email: "ceo@example.com" },
    update: {},
    create: {
      email: "ceo@example.com",
      passwordHash: pw,
      fullName: "CEO Demo",
      role: Role.CEO,
      salary: 0,
    },
  });

  const hr = await prisma.user.upsert({
    where: { email: "hr@example.com" },
    update: {},
    create: {
      email: "hr@example.com",
      passwordHash: pw,
      fullName: "HR Demo",
      role: Role.HR,
      salary: 0,
    },
  });

  const hod = await prisma.user.upsert({
    where: { email: "hod@example.com" },
    update: {},
    create: {
      email: "hod@example.com",
      passwordHash: pw,
      fullName: "HOD Demo",
      role: Role.HOD,
      salary: 0,
    },
  });

  const emp = await prisma.user.upsert({
    where: { email: "employee@example.com" },
    update: {},
    create: {
      email: "employee@example.com",
      passwordHash: pw,
      fullName: "Employee Demo",
      role: Role.EMPLOYEE,
      salary: 2000000, // N20,000.00 in kobo
    },
  });

  await prisma.geofence.upsert({
    where: { id: "store-default" },
    update: {},
    create: {
      id: "store-default",
      name: "Default Store Lagos",
      centerLat: 6.524379,
      centerLng: 3.379206,
      radiusMeters: 300,
      createdBy: ceo.id,
    },
  });

  await prisma.penalty.createMany({
    data: [
      { userId: emp.id, type: "DAMAGE", amount: 50000, reason: "Damaged product sample" },
      { userId: emp.id, type: "MISSED_DEAL", amount: 25000, reason: "Late to customer call" },
    ],
  });

  console.log({ ceo: ceo.email, hr: hr.email, hod: hod.email, emp: emp.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });