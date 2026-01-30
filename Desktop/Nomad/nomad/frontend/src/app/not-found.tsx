import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section py-16 text-center">
      <div className="max-w-md mx-auto">
        <p className="text-6xl mb-4" aria-hidden>🔍</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Page not found
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 transition"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
