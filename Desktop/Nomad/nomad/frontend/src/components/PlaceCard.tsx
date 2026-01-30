"use client";

import { getPlaceImageUrl } from "@/lib/placeImages";
import Link from "next/link";
import { useState } from "react";

const FALLBACK_IMAGE = "https://picsum.photos/seed/nomad-place/400/300";

type PlaceCardProps = {
  place: any;
  onAdd?: (p: any) => void;
  /** When false, only show Explore (e.g. on home Nearby Attractions). Default true. */
  showAddToTour?: boolean;
};

export default function PlaceCard({ place, onAdd, showAddToTour = true }: PlaceCardProps) {
  const primaryUrl = place.imageUrl || getPlaceImageUrl(place, "thumb");
  const [imageUrl, setImageUrl] = useState(primaryUrl);

  return (
    <div className="card p-4">
      <div className="grid grid-cols-3 gap-4 items-center">
        <img
          src={imageUrl}
          alt={place.name}
          className="w-full h-24 object-cover rounded-md col-span-1"
          onError={() => setImageUrl(FALLBACK_IMAGE)}
        />
        <div className="col-span-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{place.name}</h4>
            <span className="text-sm opacity-60">{place.distanceKm != null ? `${place.distanceKm.toFixed(1)} km` : place.distance ? `${place.distance} km` : ""}</span>
          </div>
          <p className="text-sm opacity-70 mt-1">{place.shortDescription || place.description || place.category || "Popular nearby place"}</p>
          {place.rating != null && (
            <p className="text-sm mt-1">
              <span className="inline-flex gap-0.5 text-amber-500" aria-label={`${place.rating} stars`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i}>{i <= Math.round(place.rating) ? "★" : "☆"}</span>
                ))}
              </span>
              <span className="text-slate-500 ml-1">{Number(place.rating).toFixed(1)}</span>
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <Link href={`/place/${place.id}`} className="btn-primary">Explore</Link>
            {showAddToTour && onAdd && (
              <button type="button" className="btn-outline" onClick={() => onAdd(place)}>Add to tour</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
