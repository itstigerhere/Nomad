"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GroupmatesButton({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    router.push(`/groupmates/${groupId}`);
  };

  return (
    <button
      className="btn-primary"
      onClick={handleClick}
      disabled={loading}
      style={{ minWidth: 120 }}
    >
      {loading ? "Loading..." : "View Groupmates"}
    </button>
  );
}
