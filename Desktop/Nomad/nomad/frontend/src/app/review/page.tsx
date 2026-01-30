"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { createReview, fetchReviews, fetchReviewSummary, type Review, type ReviewSummary } from "@/lib/reviewApi";
import Link from "next/link";
import { useState } from "react";

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

export default function ReviewPage() {
  const [tripId, setTripId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFetch = async () => {
    if (!tripId) return;
    setError(null);
    try {
      const [summaryData, list] = await Promise.all([
        fetchReviewSummary(Number(tripId)),
        fetchReviews(Number(tripId)),
      ]);
      setSummary(summaryData);
      setReviews(list);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load reviews");
      setSummary(null);
      setReviews([]);
    }
  };

  const handleCreate = async () => {
    if (!tripId) return;
    setError(null);
    setSubmitting(true);
    try {
      await createReview({ tripRequestId: Number(tripId), rating, comment: comment || undefined });
      await handleFetch();
      setComment("");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedPage>
      <div className="section py-12 space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-2xl font-bold">Trip Reviews & Ratings</h2>
          <p className="text-sm text-slate-600">Only users who have booked and paid for a trip can submit a review. Enter a trip ID to view or add reviews.</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Trip ID</label>
              <input
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                placeholder="e.g. 1"
                className="border rounded-xl px-4 py-2 w-32"
              />
            </div>
            <button type="button" className="btn-outline" onClick={handleFetch}>Load Reviews</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {summary && (
            <>
              <div className="flex items-center gap-4 flex-wrap pt-2">
                <StarDisplay rating={summary.averageRating} />
                <span className="text-slate-600">{summary.averageRating.toFixed(1)} ({summary.reviewCount} review{summary.reviewCount !== 1 ? "s" : ""})</span>
                {!summary.canReview && <span className="text-sm text-slate-500">Only booked users can review this trip.</span>}
                {summary.alreadyReviewed && <span className="text-sm text-slate-500">You have already reviewed this trip.</span>}
              </div>
              {summary.canReview && !summary.alreadyReviewed && (
                <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium">Your review</p>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Rating</label>
                    <StarInput value={rating} onChange={setRating} />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Comment (optional)</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2 min-h-[80px]"
                      placeholder="Share your experience..."
                    />
                  </div>
                  <button type="button" className="btn-primary" disabled={submitting} onClick={handleCreate}>
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Reviews</h3>
            {reviews.map((review) => (
              <div key={review.id} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <StarDisplay rating={review.rating} />
                  <span className="text-xs text-slate-500">
                    {review.reviewerEmail ? review.reviewerEmail.replace(/(.{2}).*(@.*)/, "$1***$2") : "Anonymous"} · {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                {review.comment && <p className="text-sm text-slate-600 mt-1">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-slate-500">
          <Link href="/trips" className="underline">View your trips</Link> to open a trip summary and leave a review there.
        </p>
      </div>
    </ProtectedPage>
  );
}
