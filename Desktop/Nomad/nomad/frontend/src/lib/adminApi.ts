import { api } from "./api";

export type RecentTripSummary = {
  tripRequestId: number;
  city: string;
  status: string;
  userId: number | null;
  userEmail: string | null;
  createdAt: string;
};

export type AdminDashboardResponse = {
  userCount: number;
  tripCount: number;
  placeCount: number;
  totalCommission: number;
  recentTrips: RecentTripSummary[];
};

export async function getDashboard(): Promise<AdminDashboardResponse> {
  const { data } = await api.get("/api/admin/dashboard");
  return data;
}

export async function getAdminTrips(): Promise<RecentTripSummary[]> {
  const { data } = await api.get("/api/admin/trips");
  return data;
}

export async function addSponsored(packageId: number): Promise<void> {
  await api.post("/api/admin/sponsored", { packageId });
}

export async function removeSponsored(packageId: number): Promise<void> {
  await api.delete(`/api/admin/sponsored/${packageId}`);
}

export async function activatePro(payload: {
  userId: number;
  plan: "MONTHLY" | "YEARLY";
  validUntil: string; // ISO datetime
}): Promise<void> {
  await api.post("/api/admin/pro/activate", payload);
}

export type PlaceCreatePayload = {
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

export type VehicleCreatePayload = {
  vehicleType: string;
  capacity: number;
  driverName: string;
  vehicleNumber: string;
  availabilityStatus: string;
};

export async function createPlace(payload: PlaceCreatePayload) {
  const { data } = await api.post("/api/admin/places", payload);
  return data;
}

export async function listPlaces() {
  const { data } = await api.get("/api/admin/places");
  return data as Array<any>;
}

export async function deletePlace(id: number) {
  await api.delete(`/api/admin/places/${id}`);
}

export async function createVehicle(payload: VehicleCreatePayload) {
  const { data } = await api.post("/api/admin/vehicles", payload);
  return data;
}

export async function listVehicles() {
  const { data } = await api.get("/api/admin/vehicles");
  return data as Array<any>;
}

export async function deleteVehicle(id: number) {
  await api.delete(`/api/admin/vehicles/${id}`);
}
