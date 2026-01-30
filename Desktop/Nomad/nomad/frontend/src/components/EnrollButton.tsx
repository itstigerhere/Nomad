"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../lib/api";

type Props = { packageId: number | string; amount: number | string };

export default function EnrollButton({ packageId, amount }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      const { data } = await api.post(`/api/packages/${packageId}/enroll`, { amount: Number(amount) });
      // redirect to payment page with tripRequestId and amount
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
    <button onClick={handleEnroll} className="btn-primary w-full" disabled={loading}>
      {loading ? 'Enrolling…' : 'Enroll & Pay'}
    </button>
  );
}
