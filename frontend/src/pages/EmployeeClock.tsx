import React, { useState } from "react";
import CameraCapture from "../components/CameraCapture";
import axios from "axios";

export default function EmployeeClock() {
  const [status, setStatus] = useState<string | null>(null);
  const token = localStorage.getItem("token") || "";

  const onCapture = async (dataUrl: string) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus("Submitting...");
        try {
          await axios.post(
            `${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/attendance/`,
            {
              type: "CLOCK_IN",
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              photoBase64: dataUrl,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setStatus("Clock-in successful");
        } catch (err: any) {
          setStatus(err?.response?.data?.message || "Failed");
        }
      },
      (err) => {
        setStatus("Geo error: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-primary-500 mb-4">Clock In</h2>
      <CameraCapture onCapture={onCapture} />
      <div className="mt-4">
        <p className="text-sm text-gray-600">Status: {status || "Idle"}</p>
      </div>
    </main>
  );
}