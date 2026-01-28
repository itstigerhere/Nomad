"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { confirmPickup, updatePickup } from "@/lib/pickupApi";
import { assignTravel, fetchTravel } from "@/lib/travelApi";
import { useState } from "react";

export default function PickupPage() {
  const [tripId, setTripId] = useState("");
  const [data, setData] = useState<any>(null);
  const [pickupTime, setPickupTime] = useState("");
  const [status, setStatus] = useState("ASSIGNED");
  const [routeMapUrl, setRouteMapUrl] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async () => {
    setError(null);
    const result = await assignTravel(Number(tripId));
    setData(result);
  };

  const handleFetch = async () => {
    setError(null);
    const result = await fetchTravel(Number(tripId));
    setData(result);
  };

  const handleUpdate = async () => {
    setError(null);
    try {
      const result = await updatePickup(Number(tripId), {
        pickupTime: pickupTime || undefined,
        status: status || undefined,
        routeMapUrl: routeMapUrl || undefined,
        vehicleId: vehicleId ? Number(vehicleId) : undefined,
      });
      setData(result);
    } catch (err) {
      setError("Update failed (admin only)");
    }
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      const result = await confirmPickup(Number(tripId), {
        pickupTime,
      });
      setData(result);
    } catch (err) {
      setError("Confirm pickup failed");
    }
  };

  return (
    <ProtectedPage>
      <div className="section py-10 sm:py-12 space-y-6">
        <div className="card p-6 space-y-5">
          <h2 className="text-2xl font-bold">Pickup & Vehicle Info</h2>

          {/* Trip + actions */}
          <div className="flex flex-wrap gap-3">
            <input
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              placeholder="Trip Request ID"
              className="rounded-xl px-4 py-2 border flex-1 min-w-[220px]"
              style={{ borderColor: "var(--color-border)" }}
            />
            <button className="btn-primary" onClick={handleAssign}>
              Assign
            </button>
            <button className="btn-outline" onClick={handleFetch}>
              Fetch
            </button>
          </div>

          {/* Pickup details */}
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              placeholder="Pickup Time (YYYY-MM-DDTHH:MM)"
              className="rounded-xl px-4 py-2 border"
              style={{ borderColor: "var(--color-border)" }}
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl px-4 py-2 border"
              style={{ borderColor: "var(--color-border)" }}
            >
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="EN_ROUTE">EN_ROUTE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <input
              value={routeMapUrl}
              onChange={(e) => setRouteMapUrl(e.target.value)}
              placeholder="Route Map URL (admin)"
              className="rounded-xl px-4 py-2 border"
              style={{ borderColor: "var(--color-border)" }}
            />

            <input
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              placeholder="Vehicle ID (admin reassignment)"
              className="rounded-xl px-4 py-2 border"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button className="btn-outline" onClick={handleConfirm}>
              Confirm Pickup (User)
            </button>
            <button className="btn-outline" onClick={handleUpdate}>
              Update Pickup (Admin)
            </button>
          </div>

          {/* Errors */}
          {error && (
            <p className="text-sm text-[rgb(220,38,38)]">{error}</p>
          )}

          {/* Result */}
          {data && (
            <div
              className="rounded-xl p-4 border space-y-1"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "rgba(28,28,30,0.03)",
              }}
            >
              <p className="font-semibold">
                Pickup: {data.pickupLocation}
              </p>
              <p className="text-sm opacity-70">
                Time: {data.pickupTime}
              </p>
              <p className="text-sm opacity-70">
                Vehicle: {data.vehicleType} · {data.vehicleNumber}
              </p>
              <p className="text-sm opacity-70">
                Driver: {data.driverName}
              </p>
              <p className="text-sm opacity-70">
                Status: {data.status}
              </p>

              {data.routeMapUrl && (
                <a
                  href={data.routeMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline"
                  style={{ color: "var(--color-brand)" }}
                >
                  Open Route Link
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );

}
