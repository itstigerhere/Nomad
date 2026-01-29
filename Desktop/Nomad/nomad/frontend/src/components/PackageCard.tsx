"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../lib/api";

type Props = {
  pkg: any;
};

export default function PackageCard({ pkg }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="card p-4">
      <img src={pkg.imageUrl || '/images/package-placeholder.jpg'} alt={pkg.name} className="h-40 w-full object-cover rounded-md" />
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
