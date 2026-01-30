import { api } from "./api";

export async function register(payload: {
  name: string;
  email: string;
  phoneNumber?: string;
  password: string;
  city: string;
  latitude: number;
  longitude: number;
  interestType: string;
  travelPreference: string;
}) {
  const { data } = await api.post("/api/auth/register", payload);
  return data;
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post("/api/auth/login", payload);
  return data;
}

export async function forgotPassword(email: string) {
  await api.post("/api/auth/forgot-password", { email });
}

export async function resetPassword(token: string, newPassword: string) {
  await api.post("/api/auth/reset-password", { token, newPassword });
}

export type MeResponse = {
  id: number;
  email: string;
  name?: string;
  phoneNumber?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  interestType?: string;
  travelPreference?: string;
  role?: string;
  profilePhotoUrl?: string;
};

export async function fetchMe() {
  const { data } = await api.get("/api/auth/me");
  return data as MeResponse;
}

/** Same as fetchMe but with cache-busting so the response is never cached (use when photo must be fresh). */
export async function fetchMeFresh(): Promise<MeResponse> {
  const { data } = await api.get("/api/auth/me", {
    params: { _: Date.now() },
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
  });
  return data as MeResponse;
}
