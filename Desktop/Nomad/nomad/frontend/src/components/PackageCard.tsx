"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

type Props = {
  pkg: any;
};

export default function PackageCard({ pkg }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnroll = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const { data } = await api.post(
        `/api/packages/${pkg.id}/enroll`,
        { amount: Number(pkg.price) }
      );

      router.push(
        `/payment?prefillAmount=${data.amount}&tripRequestId=${data.tripRequestId}`
      );
    } catch (e: any) {
      const message =
        e?.response?.data
          ? JSON.stringify(e.response.data)
          : e?.message || "unknown error";
      alert(`Enroll failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4">
      <img
        src={pkg.imageUrl || "/images/package-placeholder.jpg"}
        alt={pkg.name}
        className="h-40 w-full object-cover rounded-xl"
      />

      <div className="pt-3 space-y-2">
        <h3 className="text-lg font-semibold">{pkg.name}</h3>
        <p className="text-sm opacity-70">{pkg.shortDescription}</p>

        <div className="flex items-center justify-between pt-3">
          <div className="text-xl font-bold">₹{pkg.price}</div>

          <div className="flex gap-2">
            <Link href={`/packages/${pkg.id}`} className="btn-outline">
              Explore
            </Link>
            <button
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleEnroll}
              disabled={loading}
            >
              {loading ? "Enrolling…" : "Enroll"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
