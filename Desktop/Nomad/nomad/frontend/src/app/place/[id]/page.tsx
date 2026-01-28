"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function PlaceDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const [place, setPlace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/api/places/${id}`);
        if (!cancelled) setPlace(res.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || e.message || "Failed to load place");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  function handleAdd() {
    if (!place) return;
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
    } catch (err) {
      console.error(err);
      alert("Unable to add to tour");
    }
  }

  if (loading) return <div>Loading place…</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!place) return <div>Place not found.</div>;

  return (
    <div className="section py-8 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <img
            src={place.imageUrl || "https://via.placeholder.com/800x400?text=Place"}
            alt={place.name}
            className="w-full h-64 sm:h-72 object-cover rounded-xl"
          />

          <h2 className="text-2xl font-bold">{place.name}</h2>

          <p className="text-sm sm:text-base opacity-70">
            {place.description || place.shortDescription}
          </p>
        </div>

        {/* Sidebar */}
        <aside className="card p-5">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Details</h4>
              <p className="mt-1 text-sm opacity-70">
                {place.address || "Address not available"}
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Timings</h4>
              <p className="mt-1 text-sm opacity-70">
                {place.timing || "Open daily"}
              </p>
            </div>

            <div className="flex gap-2">
              <button className="btn-primary" onClick={handleAdd}>
                Add to tour
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

}
