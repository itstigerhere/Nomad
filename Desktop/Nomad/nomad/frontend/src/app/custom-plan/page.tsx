"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CustomPlanPage() {
  const [places, setPlaces] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Try to get location from localStorage or fallback
    let latitude: number | null = null;
    let longitude: number | null = null;
    try {
      const raw = localStorage.getItem("nomad_location");
      if (raw) {
        const loc = JSON.parse(raw);
        if (loc.latitude) latitude = Number(loc.latitude);
        if (loc.longitude) longitude = Number(loc.longitude);
      }
    } catch {}
    if (!latitude || !longitude) {
      latitude = 12.9716; // Bengaluru fallback
      longitude = 77.5946;
    }
    api.get(`/api/places/nearby?latitude=${latitude}&longitude=${longitude}&radiusKm=50&limit=50`)
      .then(res => setPlaces(res.data))
      .finally(() => setLoading(false));
  }, []);

  const togglePlace = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreateTrip = async () => {
    setCreating(true);
    // Replace with real userId and dates
    // Format date as yyyy-MM-dd for LocalDate
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const localDate = `${yyyy}-${mm}-${dd}`;
    const payload = {
      userId: 1, // TODO: get from auth
      name: "My Custom Trip",
      startDate: localDate,
      endDate: localDate,
      placeIds: Array.from(selected)
    };
    const { data } = await api.post("/api/trips/create-from-places", payload);
    setCreating(false);
    if (data && data.shareToken) {
      router.push(`/share-custom/${data.shareToken}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Create Your Custom Trip</h1>
      {loading ? (
        <div>Loading places...</div>
      ) : (
        <div className="grid gap-4 mb-6">
          {places.map((place: any) => (
            <label key={place.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${selected.has(place.id) ? "bg-blue-50 border-blue-400" : ""}`}>
              <input
                type="checkbox"
                checked={selected.has(place.id)}
                onChange={() => togglePlace(place.id)}
                className="accent-blue-600"
              />
              <span className="font-semibold">{place.name}</span>
              <span className="text-xs text-slate-500">{place.city}</span>
            </label>
          ))}
        </div>
      )}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleCreateTrip}
        disabled={creating || selected.size === 0}
      >
        {creating ? "Creating..." : "Create Trip & Get Link"}
      </button>
    </div>
  );
}
