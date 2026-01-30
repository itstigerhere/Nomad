"use client";

import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import { fetchMe } from "@/lib/authApi";
import { useCallback, useEffect, useState } from "react";

export default function InvitePage() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchMe()
      .then((me) => {
        setReferralCode(me.referralCode ?? null);
      })
      .catch(() => setReferralCode(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const referralUrl =
    typeof window !== "undefined" && referralCode
      ? `${window.location.origin}/auth?ref=${encodeURIComponent(referralCode)}`
      : "";

  const copyLink = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <ProtectedPage>
      <div className="section py-8 space-y-8">
        <div>
          <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium">
            ← Home
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mt-2">
            Invite friends
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Share your link. When friends sign up and complete their first booking, you both get rewarded.
          </p>
        </div>

        {loading && (
          <div className="card p-8 max-w-xl animate-pulse">
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        )}

        {!loading && !referralCode && (
          <div className="card p-6 max-w-xl">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We couldn&apos;t load your referral code. Try again or check your profile.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={load} className="btn-outline">
                Retry
              </button>
              <Link href="/profile" className="btn-primary">
                Go to profile
              </Link>
            </div>
          </div>
        )}

        {!loading && referralCode && (
          <>
            <div className="card p-6 max-w-xl">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Your referral link
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Share this link so friends can sign up with your code. When they complete their first trip booking, you may receive a reward.
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="flex-1 min-w-[200px] rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm font-mono text-slate-700 dark:text-slate-300"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="btn-primary shrink-0"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Your code: <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded font-mono">{referralCode}</code>
              </p>
            </div>

            <div className="card p-6 max-w-xl">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                How it works
              </h3>
              <ol className="space-y-2 text-slate-600 dark:text-slate-400 text-sm list-decimal list-inside">
                <li>Share your link with friends or on social media.</li>
                <li>They sign up using your link (their account is linked to you).</li>
                <li>When they complete their first paid booking, you may receive a reward (e.g. credit or Pro perks).</li>
                <li>They get a great trip; you get something back. Win-win.</li>
              </ol>
            </div>
          </>
        )}
      </div>
    </ProtectedPage>
  );
}
