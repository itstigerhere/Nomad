"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import MapView from "@/components/MapView";
import ProtectedPage from "@/components/ProtectedPage";
import {
  createReview,
  fetchReviewSummary,
  fetchReviews,
  type Review,
  type ReviewSummary,
} from "@/lib/reviewApi";
import { fetchRoute } from "@/lib/routeApi";
import { fetchTrip } from "@/lib/tripApi";

/** Format API date (array or string) to display string */
function formatTravelDate(date: unknown): string {
  if (date == null || date === "") return "Not set";
  try {
    let dateStr: string;
    if (Array.isArray(date)) {
      dateStr = `${date[0]}-${String(date[1]).padStart(2, "0")}-${String(date[2]).padStart(2, "0")}`;
    } else if (typeof date === "string") {
      dateStr = date;
    } else {
      return "Invalid date";
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "Error";
  }
}

/** Format time string (e.g. "09:30:00") to "9:30 AM" */
function formatTime(t: unknown): string {
  if (t == null) return "—";
  const s = String(t);
  const match = s.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return s;
  const h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

/** Format createdAt for display */
function formatCreatedAt(createdAt: unknown): string {
  if (createdAt == null) return "—";
  try {
    const d = new Date(String(createdAt));
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

function StatusBadge({ status }: { status: string }) {
  const s = String(status || "").toUpperCase();
  const styles: Record<string, string> = {
    CONFIRMED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    PLANNED: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
    REQUESTED: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    PAYMENT_PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
  };
  const cls = styles[s] || "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {status || "—"}
    </span>
  );
}

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  const r = Math.min(max, Math.max(0, Math.round(rating)));
  return (
    <span className="inline-flex gap-0.5" aria-label={`${r} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < r ? "text-amber-500" : "text-slate-300"}>
          ★
        </span>
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

export default function TripSummaryPage() {
  const params = useParams();
  const tripId = params.id;
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [tripLoading, setTripLoading] = useState(true);
  const [tripError, setTripError] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [routeGeoJson, setRouteGeoJson] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const loadTrip = useCallback(async () => {
    if (!tripId) return;
    setTripLoading(true);
    setTripError(null);
    try {
      const data = await fetchTrip(Number(tripId));
      setSummary(data);
    } catch (error) {
      setSummary(null);
      setTripError("Failed to load trip. It may not exist or you may not have access.");
    } finally {
      setTripLoading(false);
    }
  }, [tripId]);

  const loadReviews = useCallback(async () => {
    if (!tripId) return;
    try {
      const [summaryData, list] = await Promise.all([
        fetchReviewSummary(Number(tripId)),
        fetchReviews(Number(tripId)),
      ]);
      setReviewSummary(summaryData);
      setReviews(list);
    } catch {
      setReviewSummary(null);
      setReviews([]);
    }
  }, [tripId]);

  useEffect(() => {
    if (tripId) {
      loadTrip();
    }
  }, [tripId, loadTrip]);

  useEffect(() => {
    if (tripId) loadReviews();
  }, [tripId, loadReviews]);

  function getValidPlaces(places: any[]) {
    return places.filter(
      (p) =>
        typeof p.latitude === "number" &&
        typeof p.longitude === "number" &&
        !isNaN(p.latitude) &&
        !isNaN(p.longitude) &&
        Math.abs(p.latitude) > 0.01 &&
        Math.abs(p.longitude) > 0.01
    );
  }

  function hasInvalidPlaces(places: any[]) {
    return places.some(
      (p) =>
        typeof p.latitude !== "number" ||
        typeof p.longitude !== "number" ||
        isNaN(p.latitude) ||
        isNaN(p.longitude) ||
        Math.abs(p.latitude) <= 0.01 ||
        Math.abs(p.longitude) <= 0.01
    );
  }

  const currentPlan = summary?.plans?.[selectedPlanIdx ?? 0];
  const firstDayNumber = useMemo(() => {
    if (!currentPlan?.places?.length) return 1;
    return Math.min(...currentPlan.places.map((p: any) => p.dayNumber ?? 1));
  }, [currentPlan]);
  const placeCount = currentPlan?.places?.length ?? 0;
  const dayCount = useMemo(() => {
    if (!currentPlan?.places?.length) return 0;
    const days = new Set(currentPlan.places.map((p: any) => p.dayNumber));
    return days.size;
  }, [currentPlan]);

  // Fetch route from backend when we have 2+ places so MapView can draw the route line
  useEffect(() => {
    if (!summary?.tripRequestId || !currentPlan?.places?.length) {
      setRouteGeoJson(null);
      return;
    }
    const validPlaces = getValidPlaces(currentPlan.places);
    if (validPlaces.length < 2) {
      setRouteGeoJson(null);
      return;
    }
    let cancelled = false;
    fetchRoute(summary.tripRequestId, firstDayNumber, "driving")
      .then((data) => {
        if (!cancelled && data?.geoJson) setRouteGeoJson(data.geoJson);
      })
      .catch(() => {
        if (!cancelled) setRouteGeoJson(null);
      });
    return () => {
      cancelled = true;
    };
  }, [summary?.tripRequestId, currentPlan?.places, firstDayNumber]);

  const shareUrl = summary?.shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${summary.shareToken}`
    : "";

  const copyShareLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  return (
    <ProtectedPage>
      <div className="section py-8 space-y-8">
        {/* Back link */}
        <div className="flex items-center gap-4">
          <Link href="/trips" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            ← My Trips
          </Link>
          <span className="text-slate-400">|</span>
          <Link href="/" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            Home
          </Link>
        </div>

        {summary && (
          <>
            {/* Hero: trip title + key info */}
            <div className="card p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    {summary.city ? `Trip to ${summary.city}` : "Trip Summary"}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {formatTravelDate(summary.travelDate)}
                  </p>
                </div>
                <StatusBadge status={summary.status} />
              </div>

              {/* Quick stats + info grid — explicit colors for light and dark */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Trip ID</p>
                  <p className="font-semibold mt-0.5 text-slate-900 dark:text-slate-100">#{summary.tripRequestId}</p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estimated cost</p>
                  <p className="font-semibold mt-0.5 text-slate-900 dark:text-slate-100">₹ {summary.estimatedCost ?? "—"}</p>
                </div>
                {summary.groupSize != null && (
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Group size</p>
                    <p className="font-semibold mt-0.5 text-slate-900 dark:text-slate-100">{summary.groupSize}</p>
                  </div>
                )}
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Created</p>
                  <p className="font-semibold mt-0.5 text-sm text-slate-900 dark:text-slate-100">{formatCreatedAt(summary.createdAt)}</p>
                </div>
              </div>

              {summary.shareToken && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Share this trip:</span>
                  <button
                    type="button"
                    onClick={copyShareLink}
                    className="btn-outline text-sm py-2 px-3 rounded-lg"
                  >
                    {shareCopied ? "Copied!" : "Copy link"}
                  </button>
                  <a
                    href={`/share/${summary.shareToken}`}
                    className="text-sm text-brand-700 dark:text-brand-400 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open share page
                  </a>
                </div>
              )}

              {["REQUESTED", "PAYMENT_PENDING", "PLANNED"].includes(summary.status) && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                    This trip is not confirmed yet. Complete payment to confirm your booking.
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Link
                      href={`/payment?tripRequestId=${summary.tripRequestId}&prefillAmount=${summary.estimatedCost ?? ""}`}
                      className="btn-primary text-sm py-2 px-4 rounded-lg inline-block"
                    >
                      Pay to confirm
                    </Link>
                    {["REQUESTED", "PAYMENT_PENDING"].includes(summary.status) && (
                      <button
                        type="button"
                        disabled={cancelLoading}
                        onClick={async () => {
                          if (!summary?.tripRequestId) return;
                          setCancelError(null);
                          setCancelLoading(true);
                          try {
                            await cancelTrip(summary.tripRequestId);
                            await loadTrip();
                          } catch (e: any) {
                            setCancelError(e?.response?.data?.message || "Failed to cancel trip");
                          } finally {
                            setCancelLoading(false);
                          }
                        }}
                        className="btn-outline text-sm py-2 px-4 rounded-lg border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
                      >
                        {cancelLoading ? "Cancelling…" : "Cancel trip"}
                      </button>
                    )}
                  </div>
                  {cancelError && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{cancelError}</p>}
                </div>
              )}

              {summary.groupId != null && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Group trip:</span>
                  <Link
                    href={`/groupmates/${summary.groupId}`}
                    className="btn-primary text-sm py-2 px-4 rounded-lg"
                  >
                    See groupmates
                  </Link>
                  {summary.groupSize != null && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {summary.groupSize} traveler{summary.groupSize !== 1 ? "s" : ""} in this group
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Plan selector + Map + Itinerary */}
            {summary.plans && summary.plans.length > 0 && (
              <div className="card p-6 space-y-6">
                {summary.plans.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 self-center mr-2">Plan:</span>
                    {summary.plans.map((plan: any, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPlanIdx(idx)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                          (selectedPlanIdx ?? 0) === idx
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {plan.type}
                      </button>
                    ))}
                  </div>
                ) : (
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{currentPlan?.type ?? "Itinerary"}</h3>
                )}

                {/* Quick stats for this plan */}
                <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span>{placeCount} stop{placeCount !== 1 ? "s" : ""}</span>
                  {dayCount > 0 && <span>{dayCount} day{dayCount !== 1 ? "s" : ""}</span>}
                </div>

                {/* Map */}
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" style={{ height: 320 }}>
                  {hasInvalidPlaces(currentPlan?.places ?? []) && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-900/20">
                      Some places are missing coordinates and won’t appear on the map.
                    </p>
                  )}
                  <MapView
                    places={getValidPlaces(currentPlan?.places ?? []).map((p: any) => ({
                      id: p.placeId,
                      name: p.placeName,
                      city: summary.city || "",
                      latitude: p.latitude,
                      longitude: p.longitude,
                      category: p.category || "",
                      rating: typeof p.rating === "number" ? p.rating : 0,
                      distanceKm: typeof p.distanceFromPrevious === "number" ? p.distanceFromPrevious : 0,
                    }))}
                    routeGeoJson={routeGeoJson}
                    userLocation={
                      summary.userLatitude && summary.userLongitude
                        ? { latitude: summary.userLatitude, longitude: summary.userLongitude }
                        : undefined
                    }
                  />
                </div>

                {/* Itinerary as place cards */}
                <div>
                  <h4 className="font-semibold mb-3 text-slate-900 dark:text-slate-100">Day-by-day itinerary</h4>
                  <div className="space-y-3">
                    {(currentPlan?.places ?? []).map((place: any, i: number) => (
                      <div
                        key={`${place.placeId}-${i}`}
                        className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">Day {place.dayNumber}</span>
                            {place.category && (
                              <span className="text-xs rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-slate-600 dark:text-slate-400">
                                {String(place.category)}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{place.placeName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {formatTime(place.startTime)} – {formatTime(place.endTime)}
                            {typeof place.distanceFromPrevious === "number" && place.distanceFromPrevious > 0 && (
                              <span className="ml-2">· {place.distanceFromPrevious.toFixed(1)} km from previous</span>
                            )}
                          </p>
                        </div>
                        <Link
                          href={`/place/${place.placeId}`}
                          className="btn-outline text-sm py-2 px-3 rounded-lg shrink-0"
                        >
                          View place
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Ratings & Reviews */}
            <div className="card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ratings & Reviews</h3>
              {reviewSummary && (
                <>
                  <div className="flex items-center gap-4 flex-wrap">
                    <StarDisplay rating={reviewSummary.averageRating} />
                    <span className="text-slate-600 dark:text-slate-400">
                      {reviewSummary.averageRating.toFixed(1)} ({reviewSummary.reviewCount} review{reviewSummary.reviewCount !== 1 ? "s" : ""})
                    </span>
                  </div>
                  {reviewSummary.canReview && !reviewSummary.alreadyReviewed && (
                    <div className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-medium">You booked this trip. Write a review:</p>
                      <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Rating</label>
                        <StarInput value={reviewRating} onChange={setReviewRating} />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1">Comment (optional)</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 min-h-[80px] bg-transparent"
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
                            await createReview({
                              tripRequestId: Number(tripId),
                              rating: reviewRating,
                              comment: reviewComment || undefined,
                            });
                            setReviewComment("");
                            await loadReviews();
                          } catch (e: any) {
                            setReviewError(e?.response?.data?.message || "Failed to submit review");
                          } finally {
                            setReviewSubmitting(false);
                          }
                        }}
                      >
                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  )}
                  {reviewSummary.alreadyReviewed && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">You have already reviewed this trip.</p>
                  )}
                  {!reviewSummary.canReview && reviewSummary.reviewCount === 0 && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">Only users who have booked and paid for this trip can leave a review.</p>
                  )}
                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div key={r.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-2">
                          <StarDisplay rating={r.rating} />
                          <span className="text-xs text-slate-500">
                            {r.reviewerEmail ? r.reviewerEmail.replace(/(.{2}).*(@.*)/, "$1***$2") : "Anonymous"} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                        {r.comment && <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {tripLoading && (
          <div className="card p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">Loading trip…</p>
          </div>
        )}
        {!tripLoading && tripError && (
          <div className="card p-8 text-center">
            <p className="text-red-600 dark:text-red-300">{tripError}</p>
            <Link href="/trips" className="btn-outline mt-4 inline-block">Back to My Trips</Link>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
