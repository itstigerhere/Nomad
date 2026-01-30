"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../lib/api";

/** Placeholder image URLs by package name (used when API has no imageUrl) */
const PACKAGE_IMAGES: Record<string, string> = {
  "Weekend in Bengaluru": "https://picsum.photos/seed/bengaluru-weekend/400/240",
  "Mumbai Shoreline": "https://picsum.photos/seed/mumbai-shoreline/400/240",
  "Delhi Heritage Trip": "https://images.unsplash.com/photo-1665558646240-b2190160c400?w=400&h=240&fit=crop&q=80",
  "Hyderabad City Tour": "https://picsum.photos/seed/hyderabad-city/400/240",
  "Chennai Coastal Escape": "https://picsum.photos/seed/chennai-coastal/400/240",
  "Kolkata Culture Trail": "https://picsum.photos/seed/kolkata-culture/400/240",
  "Pune Heritage & Hills": "https://picsum.photos/seed/pune-heritage/400/240",
  "Jaipur Royal Experience": "https://picsum.photos/seed/jaipur-royal/400/240",
  "Goa Beach & Heritage": "https://picsum.photos/seed/goa-beach/400/240",
};
const DEFAULT_PACKAGE_IMAGE = "https://picsum.photos/seed/nomad-package/400/240";

function getPackageImageUrl(pkg: { imageUrl?: string | null; name?: string }): string {
  // Prefer our curated image for known packages (overrides API so we always show the right image)
  const byName = pkg.name ? PACKAGE_IMAGES[pkg.name] : undefined;
  if (byName) return byName;
  if (pkg.imageUrl) return pkg.imageUrl;
  return DEFAULT_PACKAGE_IMAGE;
}

type Props = {
  pkg: any;
};

export default function PackageCard({ pkg }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  async function handleEnroll() {
    setLoading(true);
    try {
      const { data } = await api.post(`/api/packages/${pkg.id}/enroll`, { amount: Number(pkg.price) });
      router.push(`/payment?prefillAmount=${data.amount}&tripRequestId=${data.tripRequestId}`);
      setLoading(false);
      return;
    } catch (e: any) {
      if (e?.response?.data) {
        alert('Enroll failed: ' + JSON.stringify(e.response.data));
      } else {
        alert('Enroll failed: ' + (e?.message || 'unknown error'));
      }
      setLoading(false);
      return;
    }
  }

  const imgSrc = imgError ? DEFAULT_PACKAGE_IMAGE : getPackageImageUrl(pkg);

  return (
    <div className="card p-4 relative">
      {pkg.sponsored && (
        <span className="absolute top-3 left-3 z-10 text-xs font-semibold px-2 py-1 rounded bg-amber-500 text-white">Sponsored</span>
      )}
      <img
        src={imgSrc}
        alt={pkg.name}
        className="h-40 w-full object-cover rounded-md"
        onError={() => setImgError(true)}
      />
      <div className="py-3">
        <h3 className="text-lg font-semibold">{pkg.name}</h3>
        <p className="text-sm opacity-70">{pkg.shortDescription}</p>
        <div className="flex items-center justify-between mt-3">
          <div className="text-xl font-bold">₹{pkg.price}</div>
          <div className="flex gap-2">
            <Link href={`/packages/${pkg.id}`} className="btn-outline">Explore</Link>
            <button className="btn-primary" onClick={handleEnroll} disabled={loading}>{loading ? 'Enrolling…' : 'Enroll'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
