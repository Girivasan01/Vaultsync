import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSafePersistStorage } from './safeStorage.js';

export const useOrgStore = create(
  persist(
    (set) => ({
      activeOrgId: null,
      activeOrgName: null,
      activeEnterpriseId: null,
      activeEnterpriseName: null,
      setActiveOrg: ({ id, name }) => set({ activeOrgId: id, activeOrgName: name, activeEnterpriseId: null, activeEnterpriseName: null }),
      setActiveEnterprise: ({ id, name }) => set({ activeEnterpriseId: id, activeEnterpriseName: name }),
      clearOrg: () => set({ activeOrgId: null, activeOrgName: null, activeEnterpriseId: null, activeEnterpriseName: null })
    }),
    {
      name: 'vaultsync-org',
      version: 1,
      storage: createSafePersistStorage(),
    }
  )
);