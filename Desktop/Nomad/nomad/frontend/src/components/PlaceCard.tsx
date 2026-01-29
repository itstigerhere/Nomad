"use client";

import Link from "next/link";
import { useTourCart } from "@/context/TourCartContext";

export default function PlaceCard({ place, onAdd }: { place: any; onAdd: (p: any) => void }) {
  const { isInCart } = useTourCart();
  const inCart = isInCart(place.id);

  return (
    <div className="card p-4">
      <div className="grid grid-cols-3 gap-4 items-center">
        <img 
          src={place.imageUrl && place.imageUrl !== 'null' && place.imageUrl !== 'undefined' 
            ? place.imageUrl 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(place.name)}&background=61c2a2&color=fff&size=400`} 
          alt={place.name} 
          className="w-full h-24 object-cover rounded-md col-span-1"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('ui-avatars.com')) {
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(place.name)}&background=61c2a2&color=fff&size=400`;
            }
          }}
        />
        <div className="col-span-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{place.name}</h4>
            <span className="text-sm opacity-60">{place.distanceKm ? `${place.distanceKm.toFixed(1)} km` : ""}</span>
          </div>
          <p className="text-sm opacity-70 mt-1">{place.shortDescription || place.description || "Popular nearby place"}</p>
          <div className="mt-3 flex gap-2">
            <Link href={`/place/${place.id}`} className="btn-outline">Explore</Link>
            <button 
              className={inCart ? "btn-outline" : "btn-primary"}
              onClick={() => onAdd(place)}
              disabled={inCart}
            >
              {inCart ? "✓ Added" : "Add to tour"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
