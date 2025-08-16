import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CEODashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data);
      } catch (e) {}
    }
    load();
  }, []);

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-primary-500 mb-4">CEO Dashboard</h2>

      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-medium">Employees</h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {employees.map((u) => (
            <div key={u.id} className="p-3 border rounded">
              <div className="font-medium">{u.fullName}</div>
              <div className="text-xs text-gray-500">{u.email}</div>
              <div className="text-sm mt-2">Salary: ₦{(u.salary / 100).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}