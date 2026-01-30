"use client";

import PackageCard from "@/components/PackageCard";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const PlacesList = dynamic(() => import("@/components/PlacesList"), { ssr: false });

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const RECENTLY_VIEWED_KEY = "nomad_recently_viewed";
const MAX_RECENT = 5;

async function fetchHomepagePackages() {
  const res = await fetch(`${API_BASE}/api/packages/homepage`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function fetchPackageById(id: number) {
  const res = await fetch(`${API_BASE}/api/packages/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

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
    <div>
      <section className="section py-14">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="badge">Weekend Travel, Reimagined</span>
            <h2 className="text-4xl font-bold leading-tight">
              Plan smart city getaways with personalized itineraries, pickup support, and seamless payments.
            </h2>
            <p className="opacity-70 text-lg">
              NOMAD helps you discover nearby places that match your interests, build efficient day plans, and
              arrange travel assistance—all in one platform.
            </p>
            <form onSubmit={handleHomeSearch} className="flex flex-wrap gap-2 items-center max-w-md">
              <input
                type="search"
                placeholder="Search packages (e.g. Mumbai, Goa…)"
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                className="flex-1 min-w-[180px] rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                aria-label="Search packages"
              />
              <button type="submit" className="btn-primary py-3 px-5 shrink-0">
                Search
              </button>
            </form>
            <div className="flex flex-wrap gap-3 items-center">
              <a className="btn-primary" href="/trip-planner">Start Planning</a>
              <a className="btn-outline" href="/map">View Map</a>
              <Link href="/packages" className="btn-outline">All packages</Link>
            </div>
          </div>
          <div className="card p-8">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Today&apos;s Highlights</h3>
                <span className="badge">City Smart Picks</span>
              </div>
              <div className="grid gap-3">
                {["Cultural Walk", "Food Trail", "Nature Escape"].map((item) => (
                  <div key={item} className="p-4 border border-[var(--color-border)] rounded-xl" style={{ backgroundColor: "rgba(97, 194, 162, 0.05)" }}>
                    <p className="font-semibold">{item}</p>
                    <p className="text-sm opacity-60">Curated for weekend travelers</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm opacity-70">
                <span>Pickup assistance</span>
                <span>Real-time route planning</span>
                <span>Secure payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {recentIds.length > 0 && (
        <section className="section pb-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl font-semibold">Continue exploring</h3>
            <Link href="/packages" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
              View all packages
            </Link>
          </div>
          {loadingRecent ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-md mb-3" />
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recentPackages.map((p: any) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="section pb-16">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">Nearby Attractions</h3>
          <p className="text-sm text-slate-600">Places near you — tap Explore to see details and location on the map.</p>
        </div>
        <PlacesList />
      </section>

      <section className="section pb-16">
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold">Featured Weekend Packages</h3>
            <a href="/packages" className="btn-outline shrink-0">Explore more packages</a>
          </div>
          <p className="text-sm opacity-70 mt-1">Choose a curated weekend package and enroll instantly.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {packages.length === 0 ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-md mb-3" />
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))
          ) : (
            packages.map((p: any) => <PackageCard key={p.id} pkg={p} />)
          )}
          {[
            { title: "Personalized Plans", desc: "Interest-based place selection and optimized routing." },
            { title: "Travel Assistance", desc: "Pickup, vehicles, and driver allocation based on group size." },
            { title: "Secure Payments", desc: "Razorpay integration with instant confirmation." },
          ].map((feature) => (
            <div key={feature.title} className="card p-6">
              <h4 className="font-semibold text-lg">{feature.title}</h4>
              <p className="text-sm opacity-70 mt-2">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
