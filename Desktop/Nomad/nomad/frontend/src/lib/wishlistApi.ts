import { api } from "./api";

export type WishlistItemResponse = {
  id: number;
  targetId: string;
  targetType: string;
  notifyPriceBelow?: number | null;
  notifyDates?: string | null;
  createdAt: string;
};

export async function addToWishlist(payload: {
  targetId: string;
  targetType: "PACKAGE" | "CITY";
  notifyPriceBelow?: number;
  notifyDates?: string;
}): Promise<WishlistItemResponse> {
  const { data } = await api.post("/api/wishlist", payload);
  return data;
}

export async function removeFromWishlist(targetId: string, targetType: string): Promise<void> {
  await api.delete("/api/wishlist", { params: { targetId, targetType } });
}

export async function getWishlist(): Promise<WishlistItemResponse[]> {
  const { data } = await api.get("/api/wishlist");
  return data;
}

export async function checkWishlist(targetId: string, targetType: string): Promise<boolean> {
  const { data } = await api.get("/api/wishlist/check", { params: { targetId, targetType } });
  return data;
}
