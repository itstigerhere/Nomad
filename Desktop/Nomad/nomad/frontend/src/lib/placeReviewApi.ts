import { api } from "./api";

export type PlaceReview = {
  id: number;
  placeId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewerEmail?: string;
};

export async function createPlaceReview(
  placeId: number,
  payload: { rating: number; comment?: string }
) {
  const body = {
    rating: Number(payload.rating),
    comment: payload.comment ?? "",
  };
  const { data } = await api.post(`/api/place-reviews/place/${placeId}`, body);
  return data;
}

export async function fetchPlaceReviews(placeId: number): Promise<PlaceReview[]> {
  const { data } = await api.get(`/api/place-reviews/place/${placeId}`);
  return data;
}

export async function fetchPlaceAverageRating(placeId: number): Promise<number> {
  const { data } = await api.get(`/api/place-reviews/place/${placeId}/average`);
  return data;
}
