import { api } from "./api";

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
};

export async function createTrip(payload: TripCreatePayload) {
  const { data } = await api.post("/api/trips/create", payload);
  return data;
}

export async function fetchTrip(tripId: number) {
  const { data } = await api.get(`/api/trips/${tripId}`);
  return data;
}

export async function deleteTrip(tripId: number) {
  const { data } = await api.delete(`/api/trips/${tripId}`);
  return data;
}

export async function fetchMyTrips() {
  const { data } = await api.get('/api/trips/me');
  return data;
}
