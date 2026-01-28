"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { createReview, fetchReviews } from "@/lib/reviewApi";
import { useState } from "react";

export default function ReviewPage() {
  const [tripId, setTripId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);

  const handleCreate = async () => {
    await createReview({ tripRequestId: Number(tripId), rating: Number(rating), comment });
    const data = await fetchReviews(Number(tripId));
    setReviews(data);
  };

  const handleFetch = async () => {
    const data = await fetchReviews(Number(tripId));
    setReviews(data);
  };

  return (
    <ProtectedPage>
      <div className="section py-10 sm:py-12 space-y-6">
        {/* Form */}
        <div className="card p-6 space-y-5">
          <h2 className="text-2xl font-bold">Review & Feedback</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
              placeholder="Trip Request ID"
              className="rounded-xl px-4 py-2 border"
              style={{ borderColor: "var(--color-border)" }}
            />

            <input
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Rating (1–5)"
              className="rounded-xl px-4 py-2 border"
              style={{ borderColor: "var(--color-border)" }}
            />

            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment"
              className="rounded-xl px-4 py-2 border"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="btn-primary" onClick={handleCreate}>
              Submit Review
            </button>
            <button className="btn-outline" onClick={handleFetch}>
              Fetch Reviews
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="card p-4 space-y-1">
              <p className="font-semibold">Rating: {review.rating}</p>
              <p className="text-sm opacity-70">{review.comment}</p>
              <p className="text-xs opacity-50">{review.createdAt}</p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedPage>
  );

}
