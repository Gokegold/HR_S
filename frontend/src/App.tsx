import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import EmployeeClock from "./pages/EmployeeClock";
import CEOGeofenceEditor from "./pages/CEOGeofenceEditor";
import HRDashboard from "./pages/HRDashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/me/clock" element={<EmployeeClock />} />
        <Route path="/ceo/geofence" element={<CEOGeofenceEditor />} />
        <Route path="/hr" element={<HRDashboard />} />
      </Routes>
    </div>
  );
}