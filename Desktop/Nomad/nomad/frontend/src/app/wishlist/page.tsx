"use client";

import Link from "next/link";
import ProtectedPage from "@/components/ProtectedPage";
import { getWishlist, removeFromWishlist, type WishlistItemResponse } from "@/lib/wishlistApi";
import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

const DEFAULT_IMG = "https://picsum.photos/seed/nomad-package/400/240";

type EnrichedItem = WishlistItemResponse & {
  title?: string;
  imageUrl?: string | null;
  subtitle?: string;
  href: string;
};

function useWishlist() {
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getWishlist();
      const enriched: EnrichedItem[] = await Promise.all(
        list.map(async (item): Promise<EnrichedItem> => {
          if (item.targetType === "PACKAGE") {
            try {
              const { data } = await api.get(`/api/packages/${item.targetId}`);
              return {
                ...item,
                title: data.name,
                imageUrl: data.imageUrl,
                subtitle: data.shortDescription,
                href: `/packages/${item.targetId}`,
              };
            } catch {
              return {
                ...item,
                title: `Package #${item.targetId}`,
                href: `/packages/${item.targetId}`,
              };
            }
          }
          return {
            ...item,
            title: item.targetId,
            subtitle: "City",
            href: "/packages",
          };
        })
      );
      setItems(enriched);
    } catch (e) {
      setError("Failed to load wishlist");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(
    async (targetId: string, targetType: string) => {
      try {
        await removeFromWishlist(targetId, targetType);
        setItems((prev) => prev.filter((i) => i.targetId !== targetId || i.targetType !== targetType));
      } catch {
        // keep list as is
      }
    },
    []
  );

  return { items, loading, error, remove, refresh: load };
}

export default function WishlistPage() {
  const { items, loading, error, remove, refresh } = useWishlist();

  return (
    <ProtectedPage>
      <div className="section py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium">
              ← Home
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              My Wishlist
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Packages and cities you saved for later.
            </p>
          </div>
          <button type="button" onClick={refresh} className="btn-outline text-sm py-2 px-4">
            Refresh
          </button>
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-36 bg-slate-200 dark:bg-slate-700 rounded-lg mb-3" />
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button type="button" onClick={refresh} className="btn-primary">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Your wishlist is empty. Save packages or cities from their pages.
            </p>
            <Link href="/packages" className="btn-primary inline-flex">
              Browse packages
            </Link>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={`${item.targetType}-${item.targetId}`} className="card p-0 overflow-hidden group relative">
                <Link href={item.href} className="block">
                  <div className="h-40 bg-slate-100 dark:bg-slate-800 relative">
                    {item.targetType === "PACKAGE" && (item.imageUrl || item.title) ? (
                      <img
                        src={item.imageUrl || DEFAULT_IMG}
                        alt={item.title || "Package"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_IMG;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-4xl">
                        {item.targetType === "CITY" ? "🏙️" : "📦"}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {item.targetType}
                      </p>
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.title || item.targetId}
                      </h3>
                      {item.subtitle && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        remove(item.targetId, item.targetType);
                      }}
                      className="shrink-0 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition"
                      title="Remove from wishlist"
                    >
                      Remove
                    </button>
                  </div>
                  <Link
                    href={item.href}
                    className="mt-3 inline-block text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
