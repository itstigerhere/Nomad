"use client";

import MapView from "@/components/MapView";
import { api } from "@/lib/api";
import type { PlaceNearby } from "@/lib/placeApi";
import {
  createPlaceReview,
  fetchPlaceAverageRating,
  fetchPlaceReviews,
  type PlaceReview,
} from "@/lib/placeReviewApi";
import { getPlaceImageUrl } from "@/lib/placeImages";
import { getPlaceActivities } from "@/lib/placeActivities";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const FALLBACK_PLACE_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop&q=80";

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  const r = Math.min(max, Math.max(0, Math.round(rating)));
  return (
    <span className="inline-flex gap-0.5" aria-label={`${r} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < r ? "text-amber-500" : "text-slate-300 dark:text-slate-600"}>★</span>
      ))}
    </span>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl leading-none transition ${value >= star ? "text-amber-500" : "text-slate-300 dark:text-slate-600"} hover:opacity-80 hover:scale-110`}
          aria-label={`${star} stars`}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export default function PlaceDetailsPage() {
  const params = useParams();
  const id = params?.id;
  const [place, setPlace] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [placeImageUrl, setPlaceImageUrl] = useState<string | null>(null);
  const [placeReviews, setPlaceReviews] = useState<PlaceReview[]>([]);
  const [placeAverageRating, setPlaceAverageRating] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/api/places/${id}`);
        if (!cancelled) setPlace(res.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || e.message || "Failed to load place");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    setPlaceImageUrl(null);
  }, [id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("nomad_token"));
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const [reviews, avg] = await Promise.all([
          fetchPlaceReviews(Number(id)),
          fetchPlaceAverageRating(Number(id)),
        ]);
        if (!cancelled) {
          setPlaceReviews(reviews);
          setPlaceAverageRating(avg);
        }
      } catch {
        if (!cancelled) {
          setPlaceReviews([]);
          setPlaceAverageRating(null);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let latitude: number | null = null;
    let longitude: number | null = null;
    try {
      const raw = localStorage.getItem("nomad_location");
      if (raw) {
        const loc = JSON.parse(raw);
        if (loc.latitude != null) latitude = Number(loc.latitude);
        if (loc.longitude != null) longitude = Number(loc.longitude);
      }
    } catch (_) {}
    if (latitude != null && longitude != null) {
      setUserLocation({ latitude, longitude });
      return;
    }
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {},
        { timeout: 7000 }
      );
    }
  }, []);

  function handleAdd() {
    if (!place) return;
    try {
      const raw = localStorage.getItem("nomad_tour");
      const arr = raw ? JSON.parse(raw) : [];
      if (!arr.find((p: any) => p.id === place.id)) {
        arr.push({ id: place.id, name: place.name });
        localStorage.setItem("nomad_tour", JSON.stringify(arr));
        alert(`${place.name} added to your tour`);
      } else {
        alert(`${place.name} already in your tour`);
      }
    } catch (err) {
      console.error(err);
      alert("Unable to add to tour");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="section py-8 max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </nav>
          <div className="rounded-2xl h-72 sm:h-80 bg-slate-200 dark:bg-slate-700 animate-pulse mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-700/60 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-700/60 rounded animate-pulse" />
              <div className="h-12 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700/60 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className="text-5xl mb-4" aria-hidden>⚠️</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Couldn&apos;t load place</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 transition"
            >
              Try again
            </button>
            <Link href="/packages" className="rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold px-5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              Browse packages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className="text-5xl mb-4" aria-hidden>🔍</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Place not found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">This place may have been removed or the link is invalid.</p>
          <Link href="/packages" className="inline-flex rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 transition">
            Browse packages
          </Link>
        </div>
      </div>
    );
  }

  const placeForMap: PlaceNearby = {
    id: Number(place.id),
    name: place.name,
    city: place.city || "",
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    category: String(place.category || ""),
    rating: Number(place.rating) || 0,
    distanceKm: 0,
  };

  const mapCenter: [number, number] =
    place.latitude != null && place.longitude != null
      ? [Number(place.longitude), Number(place.latitude)]
      : [77.5946, 12.9716];

  const heroImageUrl = placeImageUrl ?? place.imageUrl ?? getPlaceImageUrl(place, "large");
  const avgRating = placeAverageRating ?? place.rating ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Home</Link>
          <span aria-hidden>/</span>
          <Link href="/packages" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Places</Link>
          <span aria-hidden>/</span>
          <span className="text-slate-900 dark:text-white font-medium truncate">{place.name}</span>
        </nav>

        {/* Hero image */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="aspect-[21/9] sm:aspect-[2/1] min-h-[200px] relative bg-slate-200 dark:bg-slate-800">
            <img
              src={heroImageUrl}
              alt={place.name}
              className="w-full h-full object-cover"
              onError={() => setPlaceImageUrl(FALLBACK_PLACE_IMAGE)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-lg">{place.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <StarDisplay rating={avgRating} />
                  <span className="text-white/90 text-sm font-medium">{avgRating.toFixed(1)}</span>
                </span>
                {place.city && (
                  <span className="text-white/80 text-sm flex items-center gap-1">
                    <span aria-hidden>📍</span> {place.city}
                  </span>
                )}
                {placeReviews.length > 0 && (
                  <span className="text-white/70 text-sm">{placeReviews.length} review{placeReviews.length !== 1 ? "s" : ""}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-xl" aria-hidden>📖</span> About
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {place.description || place.shortDescription || `${place.name} — ${place.city || ""}`}
              </p>
              {(place.openingHours || place.category) && (
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {place.openingHours && (
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span aria-hidden>🕐</span> {place.openingHours}
                    </span>
                  )}
                  {place.category && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
                      {place.category}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-lg" aria-hidden>📍</span> Location
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {place.latitude != null && place.longitude != null
                  ? `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`
                  : place.address || "—"}
              </p>
              {place.city && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">City:</span> {place.city}
                </p>
              )}
              <h3 className="font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <span className="text-lg" aria-hidden>🎯</span> Activities
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{getPlaceActivities(place)}</p>
              <button
                type="button"
                onClick={handleAdd}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Add to tour
              </button>
            </div>
          </div>
        </div>

        {/* Ratings & Reviews */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-xl" aria-hidden>⭐</span> Ratings & Reviews
          </h3>
          {isLoggedIn && !hasReviewed && (
            <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-5 space-y-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Leave a review</p>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Rating</label>
                <StarInput value={reviewRating} onChange={setReviewRating} />
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Comment (optional)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 min-h-[88px] bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="Share your experience..."
                />
              </div>
              {reviewError && <p className="text-sm text-red-600 dark:text-red-400">{reviewError}</p>}
              <button
                type="button"
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold px-5 py-2.5 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60"
                disabled={reviewSubmitting}
                onClick={async () => {
                  setReviewError(null);
                  setReviewSubmitting(true);
                  try {
                    await createPlaceReview(Number(id), { rating: reviewRating, comment: reviewComment || undefined });
                    setReviewComment("");
                    setHasReviewed(true);
                    const [reviews, avg] = await Promise.all([
                      fetchPlaceReviews(Number(id)),
                      fetchPlaceAverageRating(Number(id)),
                    ]);
                    setPlaceReviews(reviews);
                    setPlaceAverageRating(avg);
                  } catch (e: any) {
                    const msg = e?.response?.data?.message || "Failed to submit review";
                    setReviewError(msg);
                    if (msg.toLowerCase().includes("already reviewed")) setHasReviewed(true);
                  } finally {
                    setReviewSubmitting(false);
                  }
                }}
              >
                {reviewSubmitting ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          )}
          {isLoggedIn && hasReviewed && (
            <p className="text-sm text-slate-600 dark:text-slate-400 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 border border-emerald-200 dark:border-emerald-800">
              You have already reviewed this place.
            </p>
          )}
          {!isLoggedIn && (
            <p className="text-sm text-slate-600 dark:text-slate-400">Log in to leave a review.</p>
          )}
          <div className="space-y-4">
            {placeReviews.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No reviews yet. Be the first!</p>
            )}
            {placeReviews.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-4"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <StarDisplay rating={r.rating} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {r.reviewerEmail ? r.reviewerEmail.replace(/(.{2}).*(@.*)/, "$1***$2") : "Anonymous"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="text-xl" aria-hidden>🗺️</span> Place on map
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            {userLocation ? "Red marker: your location. Blue marker: this place." : "Blue marker: this place. Enable location to see your position."}
          </p>
          <div className="rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40" style={{ minHeight: 320 }}>
            <MapView
              places={[placeForMap]}
              center={mapCenter}
              userLocation={userLocation ?? undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
