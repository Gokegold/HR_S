import express from "express";
import { PrismaClient } from "@prisma/client";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";
import base64url from "base64url";
import { authenticateJWT } from "../middleware/auth";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();

// In-memory challenge store for demo (replace with DB in prod)
const challenges = new Map<string, string>();

// POST /webauthn/register - returns registration options
router.post("/register", authenticateJWT, async (req: any, res) => {
  const user = req.user;
  const userEntity = await prisma.user.findUnique({ where: { id: user.id } });
  if (!userEntity) return res.status(404).json({ message: "User not found" });

  const opts = generateRegistrationOptions({
    rpName: "Perfume Retail HR",
    rpID: req.hostname || "localhost",
    userID: userEntity.id,
    userName: userEntity.email,
    attestationType: "indirect",
    authenticatorSelection: {
      userVerification: "preferred",
      residentKey: "preferred",
    },
    // prevent duplicate registration of same credential id
    excludeCredentials: (await prisma.webAuthnCredential.findMany({ where: { userId: userEntity.id } })).map((c) => ({
      id: base64url.toBuffer(c.credentialId),
      type: "public-key",
      transports: c.transports ? c.transports.split(",") : undefined,
    })),
  });

  challenges.set(userEntity.id, opts.challenge);
  res.json(opts);
});

// POST /webauthn/verify-register - verifies attestation and persists credential
router.post("/verify-register", authenticateJWT, async (req: any, res) => {
  const user = req.user;
  const body = req.body;

  const expectedChallenge = challenges.get(user.id);
  if (!expectedChallenge) return res.status(400).json({ message: "No challenge found. Start registration again." });

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      credential: body,
      expectedChallenge,
      expectedOrigin: req.protocol + "://" + req.get("host"),
      expectedRPID: req.hostname || "localhost",
    });
  } catch (e: any) {
    return res.status(400).json({ message: "Registration verification failed", error: e?.toString() });
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credentialPublicKey, credentialID, counter } = registrationInfo;
    await prisma.webAuthnCredential.create({
      data: {
        userId: user.id,
        credentialId: base64url.encode(Buffer.from(credentialID)),
        publicKey: base64url.encode(Buffer.from(credentialPublicKey)),
        transports: body.transports ? body.transports.join(",") : null,
      },
    });
    challenges.delete(user.id);
    return res.json({ ok: true });
  }

  res.status(400).json({ message: "Could not verify registration" });
});

// POST /webauthn/authenticate - returns assertion options
router.post("/authenticate", async (req: any, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Missing email" });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const credentials = await prisma.webAuthnCredential.findMany({ where: { userId: user.id } });

  const opts = generateAuthenticationOptions({
    allowCredentials: credentials.map((c) => ({
      id: base64url.toBuffer(c.credentialId),
      type: "public-key",
      transports: c.transports ? c.transports.split(",") : undefined,
    })),
    userVerification: "preferred",
    timeout: 60000,
  });

  challenges.set(user.id, opts.challenge);
  res.json({ ...opts, userId: user.id });
});

// POST /webauthn/verify-auth - verify assertion
router.post("/verify-auth", async (req: any, res) => {
  const { userId, credential } = req.body;
  if (!userId || !credential) return res.status(400).json({ message: "Missing fields" });
  const expectedChallenge = challenges.get(userId);
  if (!expectedChallenge) return res.status(400).json({ message: "No challenge present for user" });

  const dbCred = await prisma.webAuthnCredential.findFirst({ where: { userId, credentialId: base64url.encode(Buffer.from(credential.rawId, "base64")) } });
  if (!dbCred) return res.status(404).json({ message: "Credential not found" });

  let verification: VerifiedAuthenticationResponse;
  try {
    verification = await verifyAuthenticationResponse({
      credential,
      expectedChallenge,
      expectedOrigin: req.protocol + "://" + req.get("host"),
      expectedRPID: req.hostname || "localhost",
      authenticator: {
        credentialID: base64url.toBuffer(dbCred.credentialId),
        credentialPublicKey: base64url.toBuffer(dbCred.publicKey),
        counter: 0,
      },
    });
  } catch (e: any) {
    return res.status(400).json({ message: "Authentication verification failed", error: e?.toString() });
  }

  if (verification.verified) {
    // issue JWT
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || "secret", { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
    challenges.delete(userId);
    return res.json({ ok: true, token });
  }
  res.status(400).json({ message: "Could not verify assertion" });
});

export default router;