import React, { useEffect, useState } from "react";
import axios from "axios";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export default function HRDashboard() {
  const [penalties, setPenalties] = useState<any[]>([]);
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    async function load() {
      try {
        const p = await axios.get(`${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/penalties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPenalties(p.data);
      } catch (e) {
        // ignore
      }
    }
    load();
  }, []);

  const grouped = penalties.reduce((acc: any, p: any) => {
    acc[p.type] = (acc[p.type] || 0) + p.amount;
    return acc;
  }, {});

  const data = Object.keys(grouped).map((k) => ({ name: k, value: grouped[k] }));

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-primary-500 mb-4">HR Dashboard</h2>

      <section className="bg-white p-4 rounded shadow mb-4">
        <h3 className="font-medium">Penalty summary</h3>
        {data.length === 0 ? (
          <p className="text-sm text-gray-600">No penalties yet</p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={70} fill="#8884d8">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#0f8554", "#0ea5e9", "#33a1b8", "#5cc18e"][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-medium">Recent penalties</h3>
        <ul className="mt-2">
          {penalties.map((p) => (
            <li key={p.id} className="border-b py-2">
              <div className="flex justify-between">
                <div>
                  <div className="text-sm font-medium">{p.reason || p.type}</div>
                  <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">₦{(p.amount / 100).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{p.active ? "Active" : "Resolved"}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}