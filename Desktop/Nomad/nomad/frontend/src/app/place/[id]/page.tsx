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

const FALLBACK_PLACE_IMAGE = "https://picsum.photos/seed/nomad-place-detail/800/400";

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  const r = Math.min(max, Math.max(0, Math.round(rating)));
  return (
    <span className="inline-flex gap-0.5" aria-label={`${r} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < r ? "text-amber-500" : "text-slate-300"}>★</span>
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
          className={`text-2xl leading-none ${value >= star ? "text-amber-500" : "text-slate-300"} hover:opacity-80`}
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

  if (loading) return <div className="section py-8">Loading place…</div>;
  if (error) return <div className="section py-8 text-red-600">{error}</div>;
  if (!place) return <div className="section py-8">Place not found.</div>;

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

  return (
    <div className="section py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-slate-600 hover:text-slate-900">← Back to Home</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <img
            src={heroImageUrl}
            alt={place.name}
            className="w-full h-72 object-cover rounded-md"
            onError={() => setPlaceImageUrl(FALLBACK_PLACE_IMAGE)}
          />
          <h2 className="text-2xl font-bold mt-4">{place.name}</h2>
          <p className="text-slate-600 mt-2">{place.description || place.shortDescription || `${place.name} — ${place.city || ""}`}</p>
          {place.openingHours && (
            <p className="text-sm text-slate-500 mt-1">Opening hours: {place.openingHours}</p>
          )}
          {place.category && <p className="text-sm text-slate-500 mt-1">Category: {place.category}</p>}
          <div className="flex items-center gap-2 mt-2">
            <StarDisplay rating={placeAverageRating ?? place.rating ?? 0} />
            <span className="text-sm text-slate-600">
              {placeAverageRating != null
                ? `${placeAverageRating.toFixed(1)} (${placeReviews.length} review${placeReviews.length !== 1 ? "s" : ""})`
                : place.rating != null
                  ? `Place rating: ${place.rating}`
                  : ""}
            </span>
          </div>
        </div>
        <div className="card p-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold">Location</h4>
              <p className="text-sm text-slate-600 mt-1">
                {place.latitude != null && place.longitude != null
                  ? `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`
                  : place.address || "—"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold">City</h4>
              <p className="text-sm text-slate-600 mt-1">{place.city || "—"}</p>
            </div>
            <div>
              <h4 className="font-semibold">Activities to do</h4>
              <p className="text-sm text-slate-600 mt-1">{getPlaceActivities(place)}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-primary" onClick={handleAdd}>Add to tour</button>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings & Reviews for place — any logged-in user can review once */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold">Ratings & Reviews</h3>
        {isLoggedIn && !hasReviewed && (
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium">Leave a review</p>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Rating</label>
              <StarInput value={reviewRating} onChange={setReviewRating} />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Comment (optional)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 min-h-[80px]"
                placeholder="Share your experience..."
              />
            </div>
            {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
            <button
              type="button"
              className="btn-primary"
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
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}
        {isLoggedIn && hasReviewed && <p className="text-sm text-slate-600">You have already reviewed this place.</p>}
        {!isLoggedIn && <p className="text-sm text-slate-600">Log in to leave a review.</p>}
        <div className="space-y-3">
          {placeReviews.map((r) => (
            <div key={r.id} className="border border-slate-100 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2">
                <StarDisplay rating={r.rating} />
                <span className="text-xs text-slate-500">
                  {r.reviewerEmail ? r.reviewerEmail.replace(/(.{2}).*(@.*)/, "$1***$2") : "Anonymous"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
              {r.comment && <p className="text-sm text-slate-700 mt-1">{r.comment}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3">Place on map</h3>
        <p className="text-sm text-slate-600 mb-3">
          {userLocation ? "Red marker: your location. Blue marker: this place." : "Blue marker: this place. Enable location to see your position."}
        </p>
        <MapView
          places={[placeForMap]}
          center={mapCenter}
          userLocation={userLocation ?? undefined}
        />
      </div>
    </div>
  );
}
