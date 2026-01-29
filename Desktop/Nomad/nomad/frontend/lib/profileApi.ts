import axios from 'axios';

export async function uploadProfilePhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('/api/users/me/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data; // returns the photo URL
}
