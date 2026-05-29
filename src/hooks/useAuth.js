import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store.js';
import { getMe } from '../api/auth.api.js';

export function useAuth() {
  const store = useAuthStore();
  useEffect(() => {
    async function loadUser() {
      try {
        if (store.accessToken && !store.user) {
          store.setUser(await getMe());
        }
      } catch (error) {
        store.logout();
      }
    }
    loadUser();
  }, [store.accessToken]);
  return store;
}
