"use client";

import Link from "next/link";

type Props = {
  place: any;
  onAdd: (p: any) => void;
};

export default function PlaceCard({ place, onAdd }: Props) {
  return (
    <div className="card p-4">
      <div className="grid grid-cols-3 gap-4 items-center">
        <img
          src={
            place.imageUrl ||
            "https://via.placeholder.com/400x300?text=Place"
          }
          alt={place.name}
          className="h-24 w-full object-cover rounded-xl"
        />

        <div className="col-span-2 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{place.name}</h4>
            {place.distance && (
              <span className="text-sm opacity-60">
                {place.distance} km
              </span>
            )}
          </div>

          <p className="text-sm opacity-70">
            {place.shortDescription ||
              place.description ||
              "Popular nearby place"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/place/${place.id}`}
              className="btn-outline"
            >
              Explore
            </Link>
            <button
              className="btn-primary"
              onClick={() => onAdd(place)}
            >
              Add to tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
