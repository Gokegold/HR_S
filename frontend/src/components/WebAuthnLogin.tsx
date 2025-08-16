import React, { useState } from "react";
import axios from "axios";
import { startAuthentication } from "@simplewebauthn/browser";

export default function WebAuthnLogin() {
  const [email, setEmail] = useState("");
  async function login() {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/webauthn/authenticate`, { email });
      const options = res.data;
      const assertion = await startAuthentication(options as any);
      const verify = await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/webauthn/verify-auth`, { userId: options.userId, credential: assertion });
      if (verify.data?.token) {
        localStorage.setItem("token", verify.data.token);
        alert("Logged in via authenticator");
        window.location.href = "/me/clock";
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Auth failed");
    }
  }

  return (
    <div className="space-y-2">
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="border p-2 rounded w-full" />
      <button onClick={login} className="bg-primary-500 text-white px-3 py-2 rounded">Sign in using Fingerprint</button>
    </div>
  );
}