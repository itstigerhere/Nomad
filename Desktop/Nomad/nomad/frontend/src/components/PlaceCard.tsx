"use client";

import Link from "next/link";
import { useTourCart } from "@/context/TourCartContext";

function getPlaceImage(placeName: string): string {
  const name = placeName.toLowerCase();
  
  // Bengaluru places
  if (name.includes('palace') || name.includes('bangalore palace')) return '/palace.jpeg';
  if (name.includes('iskcon')) return '/iskon.jpeg';
  if (name.includes('ulsoor') || name.includes('lake')) return '/lake.jpeg';
  if (name.includes('cubbon') || name.includes('park')) return '/cprk.jpeg';
  if (name.includes('lalbagh') || name.includes('botanical')) return '/lal.jpeg';
  if (name.includes('food street') || name.includes('vv puram')) return '/street.jpeg';
  
  // Delhi places
  if (name.includes('india gate')) return '/india-gate-1.jpg.jpeg';
  if (name.includes('qutub') || name.includes('minar')) return '/qutub-minar-delhi-1.jpg.jpeg';
  if (name.includes('chandni chowk')) return '/chandni-chowk-by-night.webp';
  if (name.includes('lodhi') || name.includes('garden')) return '/Lodhi_Gardens_on_a_sunny_day.jpg.jpeg';
  if (name.includes('temple') && name.includes('lotus')) return '/main-temple-building.jpg.jpeg';
  
  // Use Unsplash for dynamic images based on place name
  const searchQuery = encodeURIComponent(placeName);
  return `https://source.unsplash.com/400x300/?${searchQuery},landmark,india`;
}

export default function PlaceCard({ place, onAdd }: { place: any; onAdd: (p: any) => void }) {
  const { isInCart } = useTourCart();
  const inCart = isInCart(place.id);

  return (
    <div className="card p-4">
      <div className="grid grid-cols-3 gap-4 items-center">
        <img 
          src={getPlaceImage(place.name)}
          alt={place.name} 
          className="w-full h-24 object-cover rounded-md col-span-1"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/sample.jpg';
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
