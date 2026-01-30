import { api } from "./api";

export type PlaceResponse = {
  id: number;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  category: string;
  rating: number;
  description?: string;
  imageUrl?: string;
  openingHours?: string;
};

export type PlaceNearby = {
  id: number;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  category: string;
  rating: number;
  distanceKm: number;
};

export async function fetchPlaceById(id: number): Promise<PlaceResponse> {
  const { data } = await api.get<PlaceResponse>(`/api/places/${id}`);
  return data;
}

export async function fetchNearbyPlaces(params: {
  city?: string;
  latitude: number;
  longitude: number;
  interest?: string;
  radiusKm?: number;
  limit?: number;
}) {
  const { data } = await api.get<PlaceNearby[]>("/api/places/nearby", { params });
  return data;
}
