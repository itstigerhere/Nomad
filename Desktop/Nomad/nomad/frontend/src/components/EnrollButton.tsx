"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

type Props = {
  packageId: number | string;
  amount: number | string;
};

export default function EnrollButton({ packageId, amount }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const { data } = await api.post(
        `/api/packages/${packageId}/enroll`,
        { amount: Number(amount) }
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
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Enrolling…" : "Enroll & Pay"}
    </button>
  );
}
