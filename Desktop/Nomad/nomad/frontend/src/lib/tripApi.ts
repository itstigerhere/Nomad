import { api } from "./api";

export type PlanPreviewPayload = {
  userId: number;
  city?: string;
  weekendType?: string;
  interest?: string;
  travelMode?: string;
  pickupRequired?: boolean;
  userLatitude?: number;
  userLongitude?: number;
  travelDate?: string; // ISO format (YYYY-MM-DD)
};

export type TripCreatePayload = {
  userId: number;
  city?: string;
  weekendType?: string;
  interest?: string;
  travelMode?: string;
  pickupRequired?: boolean;
  groupSize?: number;
  userLatitude?: number;
  userLongitude?: number;
  travelDate?: string; // ISO format (YYYY-MM-DD)
  selectedPlanType: string; // e.g., "FOOD Only", "CULTURE Only", "Hybrid"
};

export async function previewPlans(payload: PlanPreviewPayload) {
  const { data } = await api.post("/api/trips/preview", payload);
  return data;
}

export async function createTrip(payload: TripCreatePayload) {
  const { data } = await api.post("/api/trips/create", payload);
  return data;
}

export async function fetchTrip(tripId: number) {
  const { data } = await api.get(`/api/trips/${tripId}`);
  return data;
}

/** GET /api/trips/me - trips for the current authenticated user */
export async function getMyTrips() {
  const { data } = await api.get("/api/trips/me");
  return data as TripResponse[];
}

/** GET /api/trips/user/{userId} - trips for a specific user (requires authz) */
export async function getTripsByUser(userId: number) {
  const { data } = await api.get(`/api/trips/user/${userId}`);
  return data as TripResponse[];
}

export type TripResponse = {
  tripRequestId: number;
  userId?: number;
  groupId?: number;
  groupSize?: number;
  city?: string;
  shareToken?: string;
  status: string;
  createdAt?: string;
  estimatedCost?: number;
  travelDate?: string;
  userLatitude?: number;
  userLongitude?: number;
  plans?: unknown[];
};
