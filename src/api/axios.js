import axios from 'axios';
import { useAuthStore } from '../store/auth.store.js';
import { useOrgStore } from '../store/org.store.js';
import { clearVaultSyncStorage } from '../store/safeStorage.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  timeout: 30000
});

// Queue for parallel requests that arrive while a refresh is in progress
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  queue = [];
};

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

      // If already refreshing, hold this request in the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }).catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          { refreshToken: store.refreshToken }
        );
        const newToken = response.data.data.accessToken;

        store.setAccessToken(newToken);
        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);

      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
