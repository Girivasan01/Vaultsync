import { createJSONStorage } from 'zustand/middleware';

function createSafeLocalStorage() {
  return {
    getItem: (name) => {
      try {
        const value = localStorage.getItem(name);
        if (!value) return null;
        JSON.parse(value);
        return value;
      } catch {
        localStorage.removeItem(name);
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        localStorage.setItem(name, value);
      } catch {
      }
    },
    removeItem: (name) => {
      localStorage.removeItem(name);
    },
  };
}

export function createSafePersistStorage() {
  return createJSONStorage(() => createSafeLocalStorage());
}

export function clearVaultSyncStorage() {
  ['vaultsync-auth', 'vaultsync-org', 'vaultsync-ui'].forEach((key) => {
    localStorage.removeItem(key);
  });
}
