"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../lib/api";

/** Placeholder image URLs by package name (used when API has no imageUrl) */
const PACKAGE_IMAGES: Record<string, string> = {
  "Weekend in Bengaluru": "https://picsum.photos/seed/bengaluru-weekend/400/240",
  "Mumbai Shoreline": "https://picsum.photos/seed/mumbai-shoreline/400/240",
  "Delhi Heritage Trip": "https://picsum.photos/seed/delhi-heritage/400/240",
  "Hyderabad City Tour": "https://picsum.photos/seed/hyderabad-city/400/240",
  "Chennai Coastal Escape": "https://picsum.photos/seed/chennai-coastal/400/240",
  "Kolkata Culture Trail": "https://picsum.photos/seed/kolkata-culture/400/240",
  "Pune Heritage & Hills": "https://picsum.photos/seed/pune-heritage/400/240",
  "Jaipur Royal Experience": "https://picsum.photos/seed/jaipur-royal/400/240",
  "Goa Beach & Heritage": "https://picsum.photos/seed/goa-beach/400/240",
};
const DEFAULT_PACKAGE_IMAGE = "https://picsum.photos/seed/nomad-package/400/240";

function getPackageImageUrl(pkg: { imageUrl?: string | null; name?: string }): string {
  if (pkg.imageUrl) return pkg.imageUrl;
  return PACKAGE_IMAGES[pkg.name || ""] || DEFAULT_PACKAGE_IMAGE;
}

type Props = {
  pkg: any;
};

export default function PackageCard({ pkg }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  async function handleEnroll() {
    // Check if user is logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("nomad_token") : null;
    if (!token) {
      if (confirm("You need to login to enroll in this package. Would you like to login now?")) {
        router.push("/auth");
      }
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/api/packages/${pkg.id}/enroll`, { amount: Number(pkg.price) });
      router.push(`/payment?prefillAmount=${data.amount}&tripRequestId=${data.tripRequestId}`);
      setLoading(false);
      return;
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Unknown error occurred';
      alert('Enrollment failed: ' + errorMsg);
      setLoading(false);
      return;
    }
  }

  const imgSrc = imgError ? DEFAULT_PACKAGE_IMAGE : getPackageImageUrl(pkg);
  
  const availableSeats = pkg.availableSeats ?? (pkg.maxCapacity ?? 20);
  const maxCapacity = pkg.maxCapacity ?? 20;
  const seatsPercentage = (availableSeats / maxCapacity) * 100;
  const isLowAvailability = seatsPercentage <= 30;
  const isCritical = seatsPercentage <= 15;

  return (
    <div className="card p-4 relative">
      {isLowAvailability && (
        <div className="absolute top-2 right-2 z-10">
          <span 
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse"
            style={{ 
              background: isCritical ? '#ef4444' : '#f59e0b',
              color: 'white'
            }}
          >
            {isCritical ? '🔥' : '⚡'} {availableSeats} Seats Left!
          </span>
        </div>
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
        
        {/* Seat Availability Indicator */}
        <div className="mt-3 mb-2 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium" style={{ color: isLowAvailability ? (isCritical ? '#ef4444' : '#f59e0b') : '#61c2a2' }}>
              {availableSeats}/{maxCapacity} seats available
            </span>
            <span className="opacity-70">{pkg.enrolledCount ?? 0} enrolled</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500 rounded-full"
              style={{ 
                width: `${Math.max(5, seatsPercentage)}%`,
                background: isCritical 
                  ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
                  : isLowAvailability
                    ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(90deg, #61c2a2 0%, #4ade80 100%)'
              }}
            />
          </div>
        </div>
        
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
