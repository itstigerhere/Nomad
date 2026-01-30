import { api } from "./api";

export type CancellationPolicyResponse = {
  fullRefundDays: number;
  partialRefundDays: number;
  partialRefundPercent: number;
  estimatedRefundAmount: number;
};

export type RefundResponse = {
  refundId: number;
  tripRequestId: number;
  paymentId: number;
  amount: number;
  reason?: string;
  status: string;
  createdAt: string;
};

export async function getCancellationPolicy(tripRequestId: number): Promise<CancellationPolicyResponse> {
  const { data } = await api.get(`/api/refunds/policy/${tripRequestId}`);
  return data;
}

export async function requestRefund(payload: {
  tripRequestId: number;
  reason?: string;
}): Promise<RefundResponse> {
  const { data } = await api.post("/api/refunds/request", payload);
  return data;
}
