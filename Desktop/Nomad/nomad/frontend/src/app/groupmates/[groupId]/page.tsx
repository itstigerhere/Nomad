"use client";

import { fetchGroupMembers, type TripGroupMemberResponse } from "@/lib/groupApi";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GroupmatesPage() {
  const params = useParams();
  const groupId = params?.groupId as string | undefined;
  const [members, setMembers] = useState<TripGroupMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    fetchGroupMembers(Number(groupId))
      .then(setMembers)
      .catch((e: unknown) =>
        setError(
          (e as { response?: { data?: { message?: string }; message?: string }; message?: string })?.response?.data?.message ||
            (e as Error)?.message ||
            "Failed to load groupmates"
        )
      )
      .finally(() => setLoading(false));
  }, [groupId]);

  return (
    <div className="section py-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Groupmates</h2>
      {loading && <div>Loading groupmates…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <ul className="space-y-4">
          {members.length === 0 && <li>No groupmates found.</li>}
          {members.map((m) => (
            <li key={m.userId} className="card p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-lg">{m.name}</div>
                <div className="text-slate-600 text-sm">{m.city} • {m.interestType}</div>
                {m.travelDate && (() => {
                  try {
                    let dateStr: string;
                    if (Array.isArray(m.travelDate)) {
                      dateStr = `${m.travelDate[0]}-${String(m.travelDate[1]).padStart(2, '0')}-${String(m.travelDate[2]).padStart(2, '0')}`;
                    } else if (typeof m.travelDate === 'string') {
                      dateStr = m.travelDate;
                    } else {
                      return null;
                    }
                    const parsedDate = new Date(dateStr);
                    if (isNaN(parsedDate.getTime())) {
                      return null;
                    }
                    return <div className="text-xs text-slate-500">Travel Date: {parsedDate.toLocaleDateString()}</div>;
                  } catch (e) {
                    return null;
                  }
                })()}
              </div>
              <div className="text-xs text-slate-500 mt-2 md:mt-0">Joined: {m.joinedAt ? new Date(m.joinedAt).toLocaleString() : "-"}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
