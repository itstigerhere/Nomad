import { api } from "./api";

export type TravelAssistanceResponse = {
  tripRequestId: number;
  pickupLocation: string;
  pickupTime: string;
  vehicleId: number;
  vehicleType: string;
  driverName: string;
  vehicleNumber: string;
  routeMapUrl?: string | null;
  status: string;
};

export async function assignPickup(tripRequestId: number): Promise<TravelAssistanceResponse> {
  const { data } = await api.post("/api/travel/assign", { tripRequestId });
  return data;
}

export async function getPickup(tripId: number): Promise<TravelAssistanceResponse> {
  const { data } = await api.get(`/api/travel/${tripId}`);
  return data;
}

export async function updatePickup(tripRequestId: number, payload: {
  pickupTime?: string;
  status?: string;
  routeMapUrl?: string;
  vehicleId?: number;
}) {
  const { data } = await api.put(`/api/travel/${tripRequestId}`, payload);
  return data;
}

export async function confirmPickup(tripRequestId: number, payload: {
  pickupTime: string;
}) {
  const { data } = await api.put(`/api/travel/${tripRequestId}/confirm`, payload);
  return data;
}
