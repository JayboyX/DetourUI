// src/services/api.ts
import axios from 'axios';

// Use your FastAPI server URL - Update this!
const API_BASE_URL = 'http://YOUR_SERVER_IP:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  checkVerification: (email: string) => api.get(`/auth/check-verification/${email}`),
};

export default api;