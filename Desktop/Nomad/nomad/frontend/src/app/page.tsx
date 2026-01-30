"use client";

import PackageCard from "@/components/PackageCard";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const PlacesList = dynamic(() => import("@/components/PlacesList"), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const RECENTLY_VIEWED_KEY = "nomad_recently_viewed";
const MAX_RECENT = 5;

async function fetchHomepagePackages(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/api/packages/homepage`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchPackageById(id: number): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/api/packages/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

const HIGHLIGHTS = [
  { title: "Cultural Walk", desc: "Heritage trails & local stories", icon: "🏛️", bgClass: "bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30" },
  { title: "Food Trail", desc: "Taste the city like a local", icon: "🍜", bgClass: "bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30" },
  { title: "Nature Escape", desc: "Parks, gardens & fresh air", icon: "🌿", bgClass: "bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30" },
];

const FEATURES = [
  { title: "Personalized Plans", desc: "Interest-based place selection and optimized routing.", icon: "🗺️", color: "text-emerald-600 dark:text-emerald-400" },
  { title: "Travel Assistance", desc: "Pickup, vehicles, and driver allocation based on group size.", icon: "🚗", color: "text-blue-600 dark:text-blue-400" },
  { title: "Secure Payments", desc: "Razorpay integration with instant confirmation.", icon: "🔒", color: "text-violet-600 dark:text-violet-400" },
];

export default function HomePage() {
  const router = useRouter();
  const [homeSearch, setHomeSearch] = useState("");
  const [packages, setPackages] = useState<any[]>([]);
  const [recentIds, setRecentIds] = useState<number[]>([]);
  const [recentPackages, setRecentPackages] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = homeSearch.trim();
    if (q) router.push(`/packages?city=${encodeURIComponent(q)}`);
    else router.push("/packages");
  };

  useEffect(() => {
    fetchHomepagePackages().then(setPackages);
  }, []);

  const loadRecentlyViewed = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      const ids: number[] = raw ? JSON.parse(raw) : [];
      const unique = [...new Set(ids)].slice(0, MAX_RECENT);
      setRecentIds(unique);
      if (unique.length === 0) {
        setRecentPackages([]);
        return;
      }
      setLoadingRecent(true);
      Promise.all(unique.map((id) => fetchPackageById(id)))
        .then((results) => results.filter(Boolean) as any[])
        .then(setRecentPackages)
        .finally(() => setLoadingRecent(false));
    } catch {
      setRecentPackages([]);
    }
  }, []);

  useEffect(() => {
    loadRecentlyViewed();
  }, [loadRecentlyViewed]);

  useEffect(() => {
    window.addEventListener("focus", loadRecentlyViewed);
    return () => window.removeEventListener("focus", loadRecentlyViewed);
  }, [loadRecentlyViewed]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 pointer-events-none" />
        <div className="section py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-xl shadow-emerald-200/50 dark:shadow-emerald-900/20 p-3 ring-2 ring-emerald-100 dark:ring-emerald-900/50">
                  <Image src="/nomads_l.svg" alt="Nomad" width={56} height={56} className="dark:hidden" />
                  <Image src="/nomads_d.svg" alt="Nomad" width={56} height={56} className="hidden dark:block" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                  Weekend Travel, Reimagined
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-slate-800 via-emerald-800 to-teal-800 dark:from-white dark:via-emerald-200 dark:to-teal-200 bg-clip-text text-transparent">
                Plan smart city getaways with personalized itineraries, pickup support, and seamless payments.
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
                NOMAD helps you discover nearby places that match your interests, build efficient day plans, and arrange travel assistance—all in one platform.
              </p>
              <form onSubmit={handleHomeSearch} className="flex flex-wrap gap-3 max-w-lg">
                <div className="flex-1 min-w-[200px] relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </span>
                  <input
                    type="search"
                    placeholder="Search packages (e.g. Mumbai, Goa…)"
                    value={homeSearch}
                    onChange={(e) => setHomeSearch(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 pl-12 pr-4 py-3.5 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-sm"
                    aria-label="Search packages"
                  />
                </div>
                <button type="submit" className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-6 py-3.5 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-[1.02] transition">
                  Search
                </button>
              </form>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/trip-planner"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition"
                >
                  <span>Start Planning</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold px-5 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
                >
                  View Map
                </Link>
                <Link
                  href="/packages"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  All packages
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl bg-white dark:bg-slate-800 shadow-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Today&apos;s Highlights</h3>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1">City Smart Picks</span>
                </div>
                <div className="grid gap-4">
                  {HIGHLIGHTS.map((item, i) => (
                    <div
                      key={item.title}
                      className={`group flex items-center gap-4 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-700 ${item.bgClass} transition cursor-default`}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">✓ Pickup assistance</span>
                  <span className="flex items-center gap-1.5">✓ Real-time route planning</span>
                  <span className="flex items-center gap-1.5">✓ Secure payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Continue exploring */}
      {recentIds.length > 0 && (
        <section className="section py-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-500 text-white font-bold shadow-lg shadow-teal-500/30">👀</span>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Continue exploring</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pick up where you left off</p>
              </div>
            </div>
            <Link href="/packages" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1">
              View all packages
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          {loadingRecent ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
                  <div className="h-44 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                  <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentPackages.map((p: any) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Nearby Attractions */}
      <section className="section py-12">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/30">📍</span>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Nearby Attractions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Places near you — tap Explore to see details and location on the map.</p>
          </div>
        </div>
        <PlacesList />
      </section>

      {/* Featured Weekend Packages */}
      <section className="section py-12 pb-20">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30">✨</span>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Weekend Packages</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose a curated package and enroll instantly.</p>
            </div>
          </div>
          <Link href="/packages" className="rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold px-5 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition shrink-0">
            Explore more packages
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
          {packages.length === 0 ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
                <div className="h-44 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))
          ) : (
            packages.map((p: any) => <PackageCard key={p.id} pkg={p} />)
          )}
        </div>

        {/* Why Nomad */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 dark:from-emerald-900/20 dark:via-teal-900/10 dark:to-slate-800 border-2 border-emerald-200/50 dark:border-emerald-800/50 p-8 md:p-10">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Why NOMAD</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center group">
                <span className="inline-block text-4xl mb-3 group-hover:scale-110 transition">{f.icon}</span>
                <h4 className={`font-bold text-lg ${f.color}`}>{f.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
