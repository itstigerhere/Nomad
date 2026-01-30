"use client";

import ProtectedPage from "@/components/ProtectedPage";
import {
    activatePro,
    addSponsored,
    createPlace,
    createVehicle,
    deletePlace,
    deleteVehicle,
    getDashboard,
    listPlaces,
    listVehicles,
    removeSponsored,
    type AdminDashboardResponse,
} from "@/lib/adminApi";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sponsoredPackageId, setSponsoredPackageId] = useState("");
  const [proForm, setProForm] = useState({ userId: "", plan: "MONTHLY" as "MONTHLY" | "YEARLY", validUntil: "" });
  const [proSuccess, setProSuccess] = useState<string | null>(null);

  const [placeForm, setPlaceForm] = useState({
    name: "",
    city: "",
    latitude: "",
    longitude: "",
    category: "CULTURE",
    rating: "4.5",
    description: "",
    imageUrl: "",
    openingHours: "",
  });

  const [vehicleForm, setVehicleForm] = useState({
    vehicleType: "CAB",
    capacity: "3",
    driverName: "",
    vehicleNumber: "",
    availabilityStatus: "AVAILABLE",
  });

  const loadData = async () => {
    setError(null);
    try {
      const [dashboardData, placesData, vehiclesData] = await Promise.all([
        getDashboard(),
        listPlaces(),
        listVehicles(),
      ]);
      setDashboard(dashboardData);
      setPlaces(placesData);
      setVehicles(vehiclesData);
    } catch (err) {
      setError("Admin data load failed");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlaceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPlaceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePlace = async () => {
    setError(null);
    try {
      await createPlace({
        name: placeForm.name,
        city: placeForm.city,
        latitude: Number(placeForm.latitude),
        longitude: Number(placeForm.longitude),
        category: placeForm.category,
        rating: Number(placeForm.rating),
        description: placeForm.description || undefined,
        imageUrl: placeForm.imageUrl || undefined,
        openingHours: placeForm.openingHours || undefined,
      });
      await loadData();
    } catch (err) {
      setError("Create place failed");
    }
  };

  const handleCreateVehicle = async () => {
    setError(null);
    try {
      await createVehicle({
        vehicleType: vehicleForm.vehicleType,
        capacity: Number(vehicleForm.capacity),
        driverName: vehicleForm.driverName,
        vehicleNumber: vehicleForm.vehicleNumber,
        availabilityStatus: vehicleForm.availabilityStatus,
      });
      await loadData();
    } catch (err) {
      setError("Create vehicle failed");
    }
  };

  const handleAddSponsored = async () => {
    const id = Number(sponsoredPackageId);
    if (!id) return;
    setError(null);
    try {
      await addSponsored(id);
      setSponsoredPackageId("");
    } catch (err) {
      setError("Failed to add sponsored package");
    }
  };

  const handleActivatePro = async () => {
    if (!proForm.userId || !proForm.validUntil) return;
    setError(null);
    setProSuccess(null);
    try {
      const validUntil = new Date(proForm.validUntil);
      if (isNaN(validUntil.getTime())) {
        setError("Invalid date for Pro valid until");
        return;
      }
      await activatePro({
        userId: Number(proForm.userId),
        plan: proForm.plan,
        validUntil: validUntil.toISOString(),
      });
      setProSuccess("Pro activated successfully");
      setProForm({ userId: "", plan: "MONTHLY", validUntil: "" });
    } catch (err) {
      setError("Failed to activate Pro");
    }
  };

  return (
    <ProtectedPage requiredRole="ADMIN">
      <div className="section py-12 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Admin Console</h2>
          <p className="text-slate-600">Manage Places, Vehicles, Dashboard, Sponsored packages and Pro.</p>
        </div>

        {dashboard && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
                <p className="text-xs text-slate-500 uppercase">Users</p>
                <p className="text-2xl font-bold">{dashboard.userCount}</p>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
                <p className="text-xs text-slate-500 uppercase">Trips</p>
                <p className="text-2xl font-bold">{dashboard.tripCount}</p>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
                <p className="text-xs text-slate-500 uppercase">Places</p>
                <p className="text-2xl font-bold">{dashboard.placeCount}</p>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-4">
                <p className="text-xs text-slate-500 uppercase">Total commission (₹)</p>
                <p className="text-2xl font-bold">{dashboard.totalCommission ?? 0}</p>
              </div>
            </div>
            {dashboard.recentTrips?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Recent trips</p>
                <ul className="space-y-1 text-sm">
                  {dashboard.recentTrips.slice(0, 5).map((t) => (
                    <li key={t.tripRequestId}>#{t.tripRequestId} — {t.city} — {t.status} — {t.userEmail ?? ""}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Sponsored package</h3>
          <p className="text-sm text-slate-600">Add a package ID to show it as sponsored (first in list).</p>
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              value={sponsoredPackageId}
              onChange={(e) => setSponsoredPackageId(e.target.value)}
              placeholder="Package ID (e.g. 101)"
              className="border rounded-xl px-4 py-2 w-40"
            />
            <button className="btn-primary" onClick={handleAddSponsored}>Add sponsored</button>
          </div>
          <p className="text-xs text-slate-500">To remove: use DELETE /api/admin/sponsored/{`{packageId}`} (e.g. via API client).</p>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Activate Pro</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              type="number"
              value={proForm.userId}
              onChange={(e) => setProForm((p) => ({ ...p, userId: e.target.value }))}
              placeholder="User ID"
              className="border rounded-xl px-4 py-2"
            />
            <select
              value={proForm.plan}
              onChange={(e) => setProForm((p) => ({ ...p, plan: e.target.value as "MONTHLY" | "YEARLY" }))}
              className="border rounded-xl px-4 py-2"
            >
              <option value="MONTHLY">MONTHLY</option>
              <option value="YEARLY">YEARLY</option>
            </select>
            <input
              type="datetime-local"
              value={proForm.validUntil}
              onChange={(e) => setProForm((p) => ({ ...p, validUntil: e.target.value }))}
              placeholder="Valid until"
              className="border rounded-xl px-4 py-2"
            />
          </div>
          <button className="btn-primary" onClick={handleActivatePro} disabled={!proForm.userId || !proForm.validUntil}>
            Activate Pro
          </button>
          {proSuccess && <p className="text-sm text-emerald-600">{proSuccess}</p>}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Create Place</h3>
            <div className="grid gap-3">
              <input
                name="name"
                value={placeForm.name}
                onChange={handlePlaceChange}
                placeholder="Name"
                className="border rounded-xl px-4 py-2"
              />
              <input
                name="city"
                value={placeForm.city}
                onChange={handlePlaceChange}
                placeholder="City"
                className="border rounded-xl px-4 py-2"
              />
              <input
                name="latitude"
                value={placeForm.latitude}
                onChange={handlePlaceChange}
                placeholder="Latitude"
                className="border rounded-xl px-4 py-2"
              />
              <input
                name="longitude"
                value={placeForm.longitude}
                onChange={handlePlaceChange}
                placeholder="Longitude"
                className="border rounded-xl px-4 py-2"
              />
              <select
                name="category"
                value={placeForm.category}
                onChange={handlePlaceChange}
                className="border rounded-xl px-4 py-2"
              >
                {[
                  "FOOD",
                  "CULTURE",
                  "NATURE",
                  "ADVENTURE",
                  "SHOPPING",
                  "NIGHTLIFE",
                  "RELAXATION",
                ].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input
                name="rating"
                value={placeForm.rating}
                onChange={handlePlaceChange}
                placeholder="Rating"
                className="border rounded-xl px-4 py-2"
              />
              <textarea
                name="description"
                value={placeForm.description}
                onChange={handlePlaceChange}
                placeholder="Description (optional)"
                className="border rounded-xl px-4 py-2"
                rows={2}
              />
              <input
                name="imageUrl"
                value={placeForm.imageUrl}
                onChange={handlePlaceChange}
                placeholder="Image URL (optional)"
                className="border rounded-xl px-4 py-2"
              />
              <input
                name="openingHours"
                value={placeForm.openingHours}
                onChange={handlePlaceChange}
                placeholder="Opening hours e.g. 9 AM - 6 PM (optional)"
                className="border rounded-xl px-4 py-2"
              />
            </div>
            <button className="btn-primary" onClick={handleCreatePlace}>
              Create Place
            </button>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Create Vehicle</h3>
            <div className="grid gap-3">
              <select
                name="vehicleType"
                value={vehicleForm.vehicleType}
                onChange={handleVehicleChange}
                className="border rounded-xl px-4 py-2"
              >
                <option value="CAB">CAB</option>
                <option value="MINI_BUS">MINI_BUS</option>
                <option value="BUS">BUS</option>
              </select>
              <input
                name="capacity"
                value={vehicleForm.capacity}
                onChange={handleVehicleChange}
                placeholder="Capacity"
                className="border rounded-xl px-4 py-2"
              />
              <input
                name="driverName"
                value={vehicleForm.driverName}
                onChange={handleVehicleChange}
                placeholder="Driver Name"
                className="border rounded-xl px-4 py-2"
              />
              <input
                name="vehicleNumber"
                value={vehicleForm.vehicleNumber}
                onChange={handleVehicleChange}
                placeholder="Vehicle Number"
                className="border rounded-xl px-4 py-2"
              />
              <select
                name="availabilityStatus"
                value={vehicleForm.availabilityStatus}
                onChange={handleVehicleChange}
                className="border rounded-xl px-4 py-2"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="UNAVAILABLE">UNAVAILABLE</option>
              </select>
            </div>
            <button className="btn-primary" onClick={handleCreateVehicle}>
              Create Vehicle
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Places</h3>
            <div className="grid gap-3">
              {places.map((place) => (
                <div key={place.id} className="flex items-center justify-between border rounded-xl p-3">
                  <div>
                    <p className="font-semibold">{place.name}</p>
                    <p className="text-xs text-slate-500">
                      {place.city} · {place.category}
                    </p>
                  </div>
                  <button
                    className="btn-outline"
                    onClick={async () => {
                      await deletePlace(place.id);
                      await loadData();
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Vehicles</h3>
            <div className="grid gap-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between border rounded-xl p-3"
                >
                  <div>
                    <p className="font-semibold">
                      {vehicle.vehicleType} · {vehicle.vehicleNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      Driver: {vehicle.driverName} · {vehicle.availabilityStatus}
                    </p>
                  </div>
                  <button
                    className="btn-outline"
                    onClick={async () => {
                      await deleteVehicle(vehicle.id);
                      await loadData();
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
