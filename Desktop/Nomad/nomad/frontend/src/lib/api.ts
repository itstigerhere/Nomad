import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL,
  timeout: 10000, // 10s - avoid hanging when backend is down
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("nomad_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
