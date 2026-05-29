import axios from 'axios';
import { useAuthStore } from '../store/auth.store.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const store = useAuthStore.getState();
    if (error.response?.status === 401 && store.refreshToken && !original._retry) {
      original._retry = true;
      try {
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: store.refreshToken });
        store.setAccessToken(response.data.data.accessToken);
        original.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        store.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
