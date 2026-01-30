"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../lib/api";

type Props = {
  packageId: number | string;
  amount: number | string;
  /** Optional trip start date (YYYY-MM-DD) for cancellation policy. */
  travelDate?: string | null;
};

export default function EnrollButton({ packageId, amount, travelDate }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleEnroll() {
    setLoading(true);
    try {
      const body: { amount: number; travelDate?: string } = { amount: Number(amount) };
      if (travelDate) body.travelDate = travelDate;
      const { data } = await api.post(`/api/packages/${packageId}/enroll`, body);
      router.push(`/payment?prefillAmount=${data.amount}&tripRequestId=${data.tripRequestId}`);
      setLoading(false);
      return;
    } catch (e: any) {
      if (e?.response?.data) {
        alert("Enroll failed: " + JSON.stringify(e.response.data));
      } else {
        alert("Enroll failed: " + (e?.message || "unknown error"));
      }
      setLoading(false);
      return;
    }
  }

  return (
    <button onClick={handleEnroll} className="btn-primary w-full" disabled={loading}>
      {loading ? "Enrolling…" : "Enroll & Pay"}
    </button>
  );
}
