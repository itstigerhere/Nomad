"use client";

import { useState } from "react";
import EnrollButton from "./EnrollButton";
import WishlistButton from "./WishlistButton";

type Props = {
  packageId: number;
  price: number;
};

export default function PackageEnrollSection({ packageId, price }: Props) {
  const [travelDate, setTravelDate] = useState("");
  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-2xl font-bold">₹{price}</div>
        <WishlistButton targetId={String(packageId)} targetType="PACKAGE" />
      </div>
      <label className="block">
        <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Trip start date (optional)</span>
        <input
          type="date"
          value={travelDate}
          min={minDate}
          onChange={(e) => setTravelDate(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-transparent"
        />
      </label>
      <EnrollButton packageId={packageId} amount={price} travelDate={travelDate || undefined} />
    </div>
  );
}
