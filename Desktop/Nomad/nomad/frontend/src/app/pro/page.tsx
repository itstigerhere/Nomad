"use client";

import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import { getProStatus } from "@/lib/proApi";
import { useCallback, useEffect, useState } from "react";

const BENEFITS = [
  "No convenience fee on bookings — save on every trip.",
  "Priority support for trip and payment queries.",
  "Exclusive access to early-bird offers and seasonal deals.",
  "Extended cancellation flexibility (subject to policy).",
];

export default function ProPage() {
  const [status, setStatus] = useState<{ pro: boolean; validUntil: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getProStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ProtectedPage>
      <div className="section py-8 space-y-8">
        <div>
          <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium">
            ← Home
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2">
            Pro Membership
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Get more from Nomad with zero convenience fees, priority support, and exclusive perks.
          </p>
        </div>

        {loading && (
          <div className="card p-8 animate-pulse max-w-2xl">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-6" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              ))}
            </div>
          </div>
        )}

        {!loading && status && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            {/* Status card */}
            <div className="card p-6 border-2 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Your status
              </h2>
              {status.pro ? (
                <>
                  <p className="text-emerald-700 dark:text-emerald-400 font-medium mb-1">
                    ✓ You are a Pro member
                  </p>
                  {status.validUntil && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Valid until {new Date(status.validUntil).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                    You&apos;re not charged convenience fees on bookings. Enjoy your benefits!
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">
                    You&apos;re on the free plan. Upgrade to Pro to waive convenience fees and unlock perks.
                  </p>
                  <Link href="/profile" className="btn-outline text-sm inline-flex mt-2">
                    View profile
                  </Link>
                </>
              )}
            </div>

            {/* Benefits */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Pro benefits
              </h2>
              <ul className="space-y-3">
                {BENEFITS.map((text, i) => (
                  <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      ✓
                    </span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!loading && !status?.pro && (
          <div className="card p-6 max-w-2xl">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
              How to upgrade
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Pro can be activated by our team for promotional or loyalty programs. If you have a code or were told you qualify, contact support. You can also refer friends — when they complete their first booking, you may receive rewards that can include Pro perks.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/invite" className="btn-primary">
                Invite friends & earn
              </Link>
              <Link href="/profile" className="btn-outline">
                Go to profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
