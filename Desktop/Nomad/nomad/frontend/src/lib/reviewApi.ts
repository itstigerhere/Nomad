import { api } from "./api";

export type Review = {
  id: number;
  tripRequestId: number;
  rating: number;
  comment?: string;
  verified?: boolean;
  createdAt: string;
  reviewerEmail?: string;
};

export type ReviewSummary = {
  averageRating: number;
  reviewCount: number;
  canReview: boolean;
  alreadyReviewed: boolean;
};

export async function createReview(payload: { tripRequestId: number; rating: number; comment?: string }) {
  const { data } = await api.post("/api/reviews", payload);
  return data;
}

export async function fetchReviews(tripRequestId: number): Promise<Review[]> {
  const { data } = await api.get(`/api/reviews/${tripRequestId}`);
  return data;
}

export async function fetchReviewSummary(tripRequestId: number): Promise<ReviewSummary> {
  const { data } = await api.get(`/api/reviews/${tripRequestId}/summary`);
  return data;
}
