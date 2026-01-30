"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PackageCard from "@/components/PackageCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

type PackageSummary = {
  id: number;
  name: string;
  shortDescription: string;
  price: number;
  imageUrl?: string;
  sponsored?: boolean;
};

export default function PackagesPage() {
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    const q = searchParams?.get("city");
    if (q) setCity(q);
  }, [searchParams]);

  const fetchPackages = useCallback(() => {
    setLoading(true);
    const cityVal = city.trim() || (searchParams?.get("city") ?? "").trim();
    const params = new URLSearchParams();
    if (cityVal) params.set("city", cityVal);
    if (minPrice.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    if (sort) params.set("sort", sort);
    const query = params.toString();
    const url = query ? `${API_BASE}/api/packages/search?${query}` : `${API_BASE}/api/packages/all`;
    fetch(url, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then(setPackages)
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, [city, minPrice, maxPrice, sort, searchParams]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  return (
    <div className="section py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">All Packages</h1>
        <Link href="/" className="text-slate-600 dark:text-slate-400 hover:underline text-sm">
          ← Home
        </Link>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">City / keyword</span>
          <input
            type="text"
            placeholder="e.g. Mumbai, Goa"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-transparent w-40"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Min price (₹)</span>
          <input
            type="number"
            placeholder="0"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-transparent w-28"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Max price (₹)</span>
          <input
            type="number"
            placeholder="Any"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-transparent w-28"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-transparent w-36"
          >
            <option value="">Featured first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
        <button type="button" onClick={fetchPackages} className="btn-primary text-sm py-2 px-4">
          Apply
        </button>
      </div>

      {loading && (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-md mb-3" />
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-3" />
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && packages.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">No packages match your filters. Try different city or price range.</p>
          <button type="button" onClick={() => { setCity(""); setMinPrice(""); setMaxPrice(""); setSort(""); }} className="btn-outline">
            Clear filters
          </button>
        </div>
      )}

      {!loading && packages.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      )}
    </div>
  );
}
