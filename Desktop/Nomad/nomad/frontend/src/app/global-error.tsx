"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <p className="text-6xl mb-4" aria-hidden>⚠️</p>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error?.message || "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
