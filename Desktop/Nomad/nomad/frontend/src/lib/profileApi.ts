import { api } from './api';

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
  const { data} = await api.post('/api/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}