import React, { useEffect, useState } from "react";
import axios from "axios";

export default function HODDashboard() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/attendance/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendance(res.data);
      } catch (e) {}
    }
    load();
  }, []);

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-primary-500 mb-4">Head of Department</h2>
      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-medium">Recent attendance (your department)</h3>
        <ul className="mt-2">
          {attendance.map((a: any) => (
            <li key={a.id} className="border-b py-2 text-sm">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{a.type}</div>
                  <div className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</div>
                </div>
                <div className="text-right text-xs text-gray-500">
                  {a.latitude?.toFixed(5)}, {a.longitude?.toFixed(5)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}