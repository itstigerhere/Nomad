"use client";

import { useState, useMemo } from "react";

import MapView from "@/components/MapView";
import { fetchNearbyPlaces, PlaceNearby } from "@/lib/placeApi";

export default function MapPage() {
  const [city, setCity] = useState("Bengaluru");
  const [latitude, setLatitude] = useState("12.9716");
  const [longitude, setLongitude] = useState("77.5946");
  const [interest, setInterest] = useState("CULTURE");
  const [places, setPlaces] = useState<PlaceNearby[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [optimizeRoute, setOptimizeRoute] = useState(true);

  const orderedPlaces = useMemo(() => {
    if (!optimizeRoute) return places;
    return [...places].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [places, optimizeRoute]);

  const handleSearch = async () => {
    setError(null);
    try {
      const data = await fetchNearbyPlaces({
        city,
        latitude: Number(latitude),
        longitude: Number(longitude),
        interest,
        radiusKm: 15,
        limit: 20,
      });
      setPlaces(data);
    } catch {
      setError("Failed to load nearby places");
    }
  };

  return (
    <div className="section py-10 sm:py-12 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Map View</h2>
        <p className="text-sm opacity-70">
          Visualize places and route suggestions.
        </p>
      </div>

      {/* Controls */}
      <div className="card p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="rounded-xl px-4 py-2 border"
            style={{ borderColor: "var(--color-border)" }}
          />
          <input
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Latitude"
            className="rounded-xl px-4 py-2 border"
            style={{ borderColor: "var(--color-border)" }}
          />
          <input
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Longitude"
            className="rounded-xl px-4 py-2 border"
            style={{ borderColor: "var(--color-border)" }}
          />
          <select
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
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

        <label className="flex items-center gap-2 text-sm opacity-70">
          <input
            type="checkbox"
            checked={optimizeRoute}
            onChange={(e) => setOptimizeRoute(e.target.checked)}
          />
          Optimize route order by distance
        </label>

        <button className="btn-primary w-full sm:w-auto" onClick={handleSearch}>
          Load Nearby Places
        </button>

        {error && (
          <p className="text-sm text-[rgb(220,38,38)]">{error}</p>
        )}
      </div>

      {/* Map */}
      <div className="card p-4">
        <MapView
          places={orderedPlaces}
          center={[Number(longitude), Number(latitude)]}
        />
      </div>

      {/* List */}
      {!!orderedPlaces.length && (
        <div className="card p-6 space-y-3">
          <h3 className="text-lg font-semibold">Nearby Places</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {orderedPlaces.map((place) => (
              <div
                key={place.id}
                className="rounded-xl p-4 border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <p className="font-semibold">{place.name}</p>
                <p className="text-sm opacity-60">
                  {place.category} · {place.distanceKm.toFixed(2)} km
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
