import axios from 'axios';
import { useAuthStore } from '../store/auth.store.js';
import { useOrgStore } from '../store/org.store.js';
import { clearVaultSyncStorage } from '../store/safeStorage.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  timeout: 30000
});

function clearSession() {
  useAuthStore.getState().logout();
  useOrgStore.getState().clearOrg();
  clearVaultSyncStorage();
}

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
    const original = error.config || {};
    const store = useAuthStore.getState();
    const authCode = error.response?.data?.code;
    const status = error.response?.status;

    if (
      authCode === 'AUTH_SUBSCRIPTION_EXPIRED' ||
      authCode === 'AUTH_USER_CORRUPTED' ||
      authCode === 'AUTH_NO_ENTERPRISE_ACCESS'
    ) {
      clearSession();
      return Promise.reject(error);
    }

    if (status === 401 && store.refreshToken && !original._retry) {
      original._retry = true;
      try {
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken: store.refreshToken });
        store.setAccessToken(response.data.data.accessToken);
        original.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
