import React from "react";
import { startRegistration } from "@simplewebauthn/browser";
import axios from "axios";

export default function WebAuthnEnroll() {
  const token = localStorage.getItem("token") || "";

  async function enroll() {
    try {
      // get registration options
      const optsRes = await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/webauthn/register`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const options = optsRes.data;

      // start create
      const attResp = await startRegistration(options as any);
      // send attestation to server
      await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/webauthn/verify-register`, attResp, { headers: { Authorization: `Bearer ${token}` } });
      alert("Fingerprint / platform authenticator enrolled successfully");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Enroll failed");
    }
  }

  return <button onClick={enroll} className="bg-accent-500 text-white px-3 py-2 rounded">Enroll Fingerprint</button>;
}