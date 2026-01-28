"use client";

import MapView from "@/components/MapView";
import ProtectedPage from "@/components/ProtectedPage";
import { fetchRoute } from "@/lib/routeApi";
import { useState } from "react";

export default function RouteViewPage() {
  const [tripId, setTripId] = useState("");
  const [dayNumber, setDayNumber] = useState("1");
  const [route, setRoute] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setError(null);
    try {
      const data = await fetchRoute(Number(tripId), Number(dayNumber));
      setRoute(data.geoJson);
    } catch (err) {
      setError("Failed to fetch route");
    }
  };

  return (
    <ProtectedPage>
      <div className="section py-10 sm:py-12 space-y-6">
        {/* Controls */}
        <div className="card p-6 space-y-5">
          <h2 className="text-2xl font-bold">Trip Route</h2>

          <div className="flex flex-wrap gap-3">
            <input
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              placeholder="Trip Request ID"
              className="rounded-xl px-4 py-2 border flex-1 min-w-[200px]"
              style={{ borderColor: "var(--color-border)" }}
            />

            <input
              value={dayNumber}
              onChange={(e) => setDayNumber(e.target.value)}
              placeholder="Day"
              className="rounded-xl px-4 py-2 border w-24"
              style={{ borderColor: "var(--color-border)" }}
            />

            <button className="btn-primary" onClick={handleFetch}>
              Fetch Route
            </button>
          </div>

          {error && (
            <p className="text-sm text-[rgb(220,38,38)]">{error}</p>
          )}
        </div>

        {/* Map */}
        <div className="card p-4">
          <MapView routeGeoJson={route} />
        </div>
      </div>
    </ProtectedPage>
  );

}
