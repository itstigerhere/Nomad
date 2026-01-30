"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="section py-16 text-center">
      <div className="max-w-md mx-auto">
        <p className="text-6xl mb-4" aria-hidden>⚠️</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {error?.message || "An unexpected error occurred."}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 transition"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
