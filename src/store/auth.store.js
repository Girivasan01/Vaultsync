import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSafePersistStorage } from './safeStorage.js';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: ({ user, accessToken, refreshToken }) => set({ user, accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null })
    }),
    {
      name: 'vaultsync-auth',
      version: 1,
      storage: createSafePersistStorage(),
    }
  )
);
