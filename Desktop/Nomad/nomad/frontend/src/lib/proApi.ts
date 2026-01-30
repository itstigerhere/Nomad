import { api } from "./api";

export type ProStatusResponse = {
  pro: boolean;
  validUntil: string | null;
};

export async function getProStatus(): Promise<ProStatusResponse> {
  const { data } = await api.get("/api/pro/status");
  return data;
}
