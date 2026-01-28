"use client";

import ProtectedPage from "@/components/ProtectedPage";
import {
    createPlace,
    createVehicle,
    deletePlace,
    deleteVehicle,
    listPlaces,
    listVehicles,
} from "@/lib/adminApi";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [places, setPlaces] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [placeForm, setPlaceForm] = useState({
    name: "",
    city: "",
    latitude: "",
    longitude: "",
    category: "CULTURE",
    rating: "4.5",
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
      const [placesData, vehiclesData] = await Promise.all([listPlaces(), listVehicles()]);
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

return (
  <ProtectedPage requiredRole="ADMIN">
    <div className="section py-10 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Admin Console</h2>
        <p className="text-sm opacity-70">
          Manage Places and Vehicles (admin role required).
        </p>
      </div>

      {error && (
        <p className="text-sm text-[rgb(220,38,38)]">{error}</p>
      )}

      {/* Create forms */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Create Place */}
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Create Place</h3>

          <div className="grid gap-3">
            {[
              { name: "name", placeholder: "Name" },
              { name: "city", placeholder: "City" },
              { name: "latitude", placeholder: "Latitude" },
              { name: "longitude", placeholder: "Longitude" },
              { name: "rating", placeholder: "Rating" },
            ].map((field) => (
              <input
                key={field.name}
                name={field.name}
                value={(placeForm as any)[field.name]}
                onChange={handlePlaceChange}
                placeholder={field.placeholder}
                className="rounded-xl px-4 py-2 border"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-bg)",
                }}
              />
            ))}

            <select
              name="category"
              value={placeForm.category}
              onChange={handlePlaceChange}
              className="rounded-xl px-4 py-2 border"
              style={{ borderColor: "var(--color-border)" }}
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
          </div>

          <button className="btn-primary" onClick={handleCreatePlace}>
            Create Place
          </button>
        </div>

        {/* Create Vehicle */}
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Create Vehicle</h3>

          <div className="grid gap-3">
            <select
              name="vehicleType"
              value={vehicleForm.vehicleType}
              onChange={handleVehicleChange}
              className="rounded-xl px-4 py-2 border"
              style={{ borderColor: "var(--color-border)" }}
            >
              <option value="CAB">CAB</option>
              <option value="MINI_BUS">MINI_BUS</option>
              <option value="BUS">BUS</option>
            </select>

            {[
              { name: "capacity", placeholder: "Capacity" },
              { name: "driverName", placeholder: "Driver Name" },
              { name: "vehicleNumber", placeholder: "Vehicle Number" },
            ].map((field) => (
              <input
                key={field.name}
                name={field.name}
                value={(vehicleForm as any)[field.name]}
                onChange={handleVehicleChange}
                placeholder={field.placeholder}
                className="rounded-xl px-4 py-2 border"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-bg)",
                }}
              />
            ))}

            <select
              name="availabilityStatus"
              value={vehicleForm.availabilityStatus}
              onChange={handleVehicleChange}
              className="rounded-xl px-4 py-2 border"
              style={{ borderColor: "var(--color-border)" }}
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

      {/* Lists */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Places */}
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Places</h3>

          <div className="grid gap-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="flex items-center justify-between rounded-xl p-3 border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div>
                  <p className="font-semibold">{place.name}</p>
                  <p className="text-xs opacity-60">
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

        {/* Vehicles */}
        <div className="card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Vehicles</h3>

          <div className="grid gap-3">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between rounded-xl p-3 border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div>
                  <p className="font-semibold">
                    {vehicle.vehicleType} · {vehicle.vehicleNumber}
                  </p>
                  <p className="text-xs opacity-60">
                    Driver: {vehicle.driverName} ·{" "}
                    {vehicle.availabilityStatus}
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