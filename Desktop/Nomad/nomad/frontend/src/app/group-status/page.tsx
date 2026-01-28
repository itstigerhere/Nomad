"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { fetchGroup, fetchGroupMembers } from "@/lib/groupApi";
import { useState } from "react";

export default function GroupStatusPage() {
  const [groupId, setGroupId] = useState("");
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setError(null);
    try {
      const [groupData, memberData] = await Promise.all([
        fetchGroup(Number(groupId)),
        fetchGroupMembers(Number(groupId)),
      ]);
      setGroup(groupData);
      setMembers(memberData);
    } catch (err) {
      setError("Failed to fetch group");
    }
  };

  return (
    <ProtectedPage>
      <div className="section py-10 sm:py-12 space-y-6">
        {/* Fetch group */}
        <div className="card p-6 space-y-4">
          <h2 className="text-2xl font-bold">Group Status</h2>

          <div className="flex flex-wrap gap-3">
            <input
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="Group ID"
              className="rounded-xl px-4 py-2 border flex-1 min-w-[220px]"
              style={{ borderColor: "var(--color-border)" }}
            />
            <button className="btn-primary" onClick={handleFetch}>
              Fetch
            </button>
          </div>

          {error && (
            <p className="text-sm text-[rgb(220,38,38)]">{error}</p>
          )}
        </div>

        {group && (
          <div className="grid gap-6">
            {/* Group details */}
            <div className="card p-6 space-y-2">
              <p className="font-semibold">Group #{group.id}</p>
              <p className="text-sm opacity-70">City: {group.city}</p>
              <p className="text-sm opacity-70">
                Interest: {group.interest}
              </p>
              <p className="text-sm opacity-70">
                Weekend: {group.weekendType}
              </p>
              <p className="text-sm opacity-70">
                Status: {group.status}
              </p>
              <p className="text-sm opacity-70">
                Size: {group.size}
              </p>
            </div>

            {/* Members */}
            <div className="card p-6 space-y-3">
              <h3 className="text-lg font-semibold">Members</h3>

              {members.length === 0 ? (
                <p className="text-sm opacity-60">No members found.</p>
              ) : (
                <div className="grid gap-3">
                  {members.map((member) => (
                    <div
                      key={member.tripRequestId}
                      className="flex items-center justify-between rounded-xl p-3 border"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-xs opacity-60">
                          {member.city} · {member.interestType}
                        </p>
                      </div>
                      <span
                        className="text-xs rounded-full px-3 py-1 border"
                        style={{
                          borderColor: "var(--color-border)",
                          opacity: 0.8,
                        }}
                      >
                        {member.tripStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}