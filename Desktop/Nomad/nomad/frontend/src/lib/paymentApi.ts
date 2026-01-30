import { api } from "./api";

export type PaymentCreateResponse = {
  paymentId: number;
  tripRequestId: number;
  amount: number;
  convenienceFee?: number | null;
  razorpayOrderId: string;
  paymentStatus: string;
  createdAt: string;
};

export async function createPayment(payload: {
  tripRequestId: number;
  amount: number;
  promoCode?: string;
}): Promise<PaymentCreateResponse> {
  const { data } = await api.post("/api/payment/create", payload);
  return data;
}

export async function verifyPayment(payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { data } = await api.post("/api/payment/verify", payload);
  return data;
}
