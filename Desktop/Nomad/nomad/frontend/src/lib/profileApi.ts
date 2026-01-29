
import axios from 'axios';
import { api } from './api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface UpdateUserPayload {
  name: string;
  city: string;
  phoneNumber?: string;
  latitude: number;
  longitude: number;
  interestType: string;
  travelPreference: string;
}

export async function updateUser(userId: number, payload: UpdateUserPayload) {
  const { data } = await api.put(`/api/users/${userId}`, payload);
  return data;
}

export async function uploadProfilePhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('nomad_token');
  const response = await axios.post(`${API_BASE_URL}/api/users/me/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    }
  });
  return response.data; // returns the photo URL
}