import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface TripResponse {
  tripRequestId: number;
  userId: number;
  city: string;
  shareToken: string;
  status: string;
  createdAt: string;
  plans: any[];
}

export interface EnrollmentRequest {
  userId: number;
  tripRequestId: number;
  paymentToken: string;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
}

export async function fetchSharedTrip(token: string): Promise<TripResponse> {
  const { data } = await axios.get(`${API_BASE_URL}/api/share/${token}`);
  return data;
}

export async function enrollInTrip(payload: EnrollmentRequest): Promise<EnrollmentResponse> {
  const { data } = await axios.post(`${API_BASE_URL}/api/enroll`, payload);
  return data;
}
