import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSafePersistStorage } from './safeStorage.js';

export const useUiStore = create(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: true,
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
    }),
    {
      name: 'vaultsync-ui',
      version: 1,
      storage: createSafePersistStorage(),
    }
  )
);
