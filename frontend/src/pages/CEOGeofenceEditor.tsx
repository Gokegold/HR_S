import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

export default function CEOGeofenceEditor() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [radius, setRadius] = useState(200);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [3.39583, 6.5244], // Lagos center default
        zoom: 12,
      });

      mapRef.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        setCenter({ lat, lng });
      });
    }
  }, []);

  async function createGeofence() {
    if (!center) return alert("Tap the map to set center");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE || "http://localhost:4000"}/geofence/`,
        {
          name: "Store Area",
          centerLat: center.lat,
          centerLng: center.lng,
          radiusMeters: radius,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Geofence created");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed");
    }
  }

  return (
    <main className="p-4">
      <h2 className="text-xl font-semibold text-primary-500 mb-2">Geofence Editor (CEO)</h2>
      <div ref={mapContainer} className="h-[400px] w-full rounded shadow mb-4" />
      <div className="flex gap-2 items-center">
        <label className="text-sm">Radius (meters)</label>
        <input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="border p-1 rounded w-28" />
        <button onClick={createGeofence} className="bg-primary-500 text-white px-3 py-1 rounded">Save Geofence</button>
      </div>
      <p className="text-sm text-gray-600 mt-2">Click map to pick center. Current center: {center ? `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}` : "none"}</p>
    </main>
  );
}