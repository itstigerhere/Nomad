"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import PlaceCard from "./PlaceCard";

export default function PlacesList() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        let latitude: number | null = null;
        let longitude: number | null = null;
        let city: string | null = null;

        try {
          const raw = localStorage.getItem("nomad_location");
          if (raw) {
            const loc = JSON.parse(raw);
            latitude = loc.latitude ? Number(loc.latitude) : null;
            longitude = loc.longitude ? Number(loc.longitude) : null;
            city = loc.city ?? null;
          }

          if (
            (!latitude || !longitude) &&
            typeof navigator !== "undefined" &&
            navigator.geolocation
          ) {
            const pos = await new Promise<GeolocationPosition>(
              (resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  timeout: 7000,
                })
            ).catch(() => null as any);

            if (pos?.coords) {
              latitude = pos.coords.latitude;
              longitude = pos.coords.longitude;
            }
          }
        } catch {
          /* ignore */
        }

        if (!latitude || !longitude) {
          latitude = 12.9716;
          longitude = 77.5946;
        }

        const token =
          process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
          (window as any).__NEXT_PUBLIC_MAPBOX_TOKEN;

        if (token && latitude && longitude) {
          try {
            const r = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=place&limit=1&access_token=${token}`
            );
            if (r.ok) {
              const j = await r.json();
              city = j.features?.[0]?.text ?? city;
            }
          } catch {
            /* ignore */
          }
        }

        try {
          localStorage.setItem(
            "nomad_location",
            JSON.stringify({ city, latitude, longitude })
          );
        } catch {
          /* ignore */
        }

        const params: any = {
          latitude,
          longitude,
          radiusKm: 50,
          limit: 50,
        };
        if (city) params.city = city;

        const res = await api.get("/api/places/nearby", { params });

        if (!cancelled) {
          setPlaces(res.data || []);
          setDebugInfo({
            params,
            status: res.status,
            count: (res.data || []).length,
          });
        }
      } catch (e: any) {
        if (!cancelled) {
          const msg =
            e?.response?.data ||
            e?.message ||
            "Failed to load places";
          setError(String(msg));
          setDebugInfo({
            params: e?.config?.params,
            status: e?.response?.status,
            error: msg,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleAdd(place: any) {
    try {
      const raw = localStorage.getItem("nomad_tour");
      const arr = raw ? JSON.parse(raw) : [];
      if (!arr.find((p: any) => p.id === place.id)) {
        arr.push({ id: place.id, name: place.name });
        localStorage.setItem("nomad_tour", JSON.stringify(arr));
        alert(`${place.name} added to your tour`);
      } else {
        alert(`${place.name} already in your tour`);
      }
    } catch {
      alert("Unable to add to tour");
    }
  }

  if (loading) {
    return <p className="text-sm opacity-70">Loading nearby places…</p>;
  }

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-[rgb(220,38,38)]">{error}</p>
        <pre className="text-xs opacity-60">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
        <button
          className="btn-outline"
          onClick={() => {
            setPlaces([
              {
                id: 1,
                name: "Demo Beach",
                shortDescription: "Demo place",
                imageUrl: null,
                distanceKm: 1,
                rating: 4.5,
              },
            ]);
            setError(null);
          }}
        >
          Use demo places
        </button>
      </div>
    );
  }

  if (!places.length) {
    return (
      <div className="space-y-2">
        <p className="text-sm opacity-70">No nearby places found.</p>
        <pre className="text-xs opacity-60">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
        <button
          className="btn-outline"
          onClick={() =>
            setPlaces([
              {
                id: 1,
                name: "Demo Beach",
                shortDescription: "Demo place",
                imageUrl: null,
                distanceKm: 1,
                rating: 4.5,
              },
            ])
          }
        >
          Use demo places
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {places.map((p) => (
        <PlaceCard key={p.id} place={p} onAdd={handleAdd} />
      ))}
    </div>
  );
}
