"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import PlaceCard from "./PlaceCard";
import { useTourCart } from "@/context/TourCartContext";

export default function PlacesList() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { addToCart } = useTourCart();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // Determine user coords (backend -> localStorage -> geolocation -> fallback)
        let latitude: number | null = null;
        let longitude: number | null = null;
        let city: string | null = null;

        try {
          // First try to get user location from backend (most up-to-date)
          const token = localStorage.getItem("nomad_token");
          if (token) {
            try {
              const userRes = await api.get("/api/users/me");
              if (userRes.data) {
                latitude = userRes.data.latitude;
                longitude = userRes.data.longitude;
                city = userRes.data.city;
                // Update localStorage with fresh data from backend
                if (latitude && longitude) {
                  localStorage.setItem("nomad_location", JSON.stringify({ city, latitude, longitude }));
                }
              }
            } catch (e) {
              console.warn("Could not fetch user location from backend:", e);
            }
          }

          // If backend didn't provide location, try localStorage
          if (!latitude || !longitude) {
            const raw = localStorage.getItem("nomad_location");
            if (raw) {
              const loc = JSON.parse(raw);
              if (loc.latitude) latitude = Number(loc.latitude);
              if (loc.longitude) longitude = Number(loc.longitude);
              if (loc.city) city = loc.city;
            }
          }

          // If still no location, try browser geolocation
          if ((!latitude || !longitude) && typeof navigator !== "undefined" && navigator.geolocation) {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 7000 });
            }).catch(() => null as any);
            if (pos && pos.coords) {
              latitude = pos.coords.latitude;
              longitude = pos.coords.longitude;
            }
          }
        } catch (e) {
          // ignore geolocation/localStorage errors
        }

        // fallback coordinates (Delhi) if nothing available
        if (!latitude || !longitude) {
          latitude = 28.6139;
          longitude = 77.2090;
          city = "Delhi";
        }

        // Normalize city names to match backend database
        const normalizeCityName = (cityName: string | null): string | null => {
          if (!cityName) return null;
          const normalized = cityName.trim();
          // Map common variations to standard names used in backend
          const cityMap: Record<string, string> = {
            "New Delhi": "Delhi",
            "delhi": "Delhi",
            "new delhi": "Delhi",
            "Bengaluru": "Bengaluru",
            "Bangalore": "Bengaluru",
            "bangalore": "Bengaluru",
            "bengaluru": "Bengaluru",
            "Mumbai": "Mumbai",
            "mumbai": "Mumbai",
            "Bombay": "Mumbai",
            "bombay": "Mumbai",
          };
          return cityMap[normalized] || normalized;
        };

        // Normalize the city name to match backend database expectations
        city = normalizeCityName(city);

        // persist the chosen location for future requests
        try {
          localStorage.setItem("nomad_location", JSON.stringify({ city, latitude, longitude }));
        } catch (e) { /* ignore storage errors */ }

        // Build params; omit city if we couldn't resolve it so backend can infer from seeded data
        const params: any = { latitude, longitude, radiusKm: 50, limit: 50 };
        if (city) params.city = city;

        const res = await api.get("/api/places/nearby", { params });
        if (!cancelled) {
          const count = (res.data || []).length;
          setDebugInfo({ params, status: res.status, count });
          setPlaces(res.data || []);
        }
      } catch (e: any) {
        const msg = e?.response?.data || e?.message || "Failed to load places";
        if (!cancelled) {
          setError(String(msg));
          setDebugInfo({ params: (e as any)?.config?.params, status: (e as any)?.response?.status, error: msg });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function handleAdd(place: any) {
    addToCart({
      id: place.id,
      name: place.name,
      city: place.city,
      category: place.category,
      imageUrl: place.imageUrl,
      latitude: place.latitude,
      longitude: place.longitude,
      rating: place.rating,
      distanceKm: place.distanceKm,
    });
  }

  if (loading) return <div>Loading nearby places…</div>;
  if (error) return (
    <div>
      <div className="text-red-600">{error}</div>
      <pre className="text-xs text-slate-500 mt-2">{JSON.stringify(debugInfo, null, 2)}</pre>
      <div className="mt-2">
        <button className="btn-outline" onClick={() => {
          // populate demo places for UI testing
          const demo = [{ id: 1, name: "Demo Beach", shortDescription: "Demo place", imageUrl: null, distanceKm: 1, rating: 4.5 }];
          setPlaces(demo);
          setError(null);
        }}>Use demo places</button>
      </div>
    </div>
  );
  if (!places || places.length === 0) return (
    <div>
      <div>No nearby places found.</div>
      <pre className="text-xs text-slate-500 mt-2">{JSON.stringify(debugInfo, null, 2)}</pre>
      <div className="mt-2">
        <button className="btn-outline" onClick={() => {
          const demo = [{ id: 1, name: "Demo Beach", shortDescription: "Demo place", imageUrl: null, distanceKm: 1, rating: 4.5 }];
          setPlaces(demo);
        }}>Use demo places</button>
      </div>
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {places.map((p) => (
        <PlaceCard key={p.id} place={p} onAdd={handleAdd} />
      ))}
    </div>
  );
}
