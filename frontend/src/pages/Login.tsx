import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/me/clock");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Login failed");
    }
  }

  return (
    <main className="flex items-center justify-center h-screen p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold text-primary-500 mb-4">HR Attendance — Sign in</h1>
        <label className="block">
          <span className="text-sm text-gray-700">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full" />
        </label>
        <label className="block mt-3">
          <span className="text-sm text-gray-700">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full" />
        </label>
        <button className="mt-6 w-full bg-accent-500 text-white py-2 rounded">Sign in</button>
      </form>
    </main>
  );
}