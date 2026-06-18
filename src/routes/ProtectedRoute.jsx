import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getMe } from '../api/auth.api.js';
import { useAuthStore } from '../store/auth.store.js';
import { useOrgStore } from '../store/org.store.js';
import { clearVaultSyncStorage } from '../store/safeStorage.js';

export default function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const clearOrg = useOrgStore((state) => state.clearOrg);
  const [checking, setChecking] = useState(Boolean(accessToken && !user));

  useEffect(() => {
    let active = true;

    async function validateSession() {
      if (!accessToken) {
        setChecking(false);
        return;
      }

      if (user) {
        setChecking(false);
        return;
      }

      try {
        const currentUser = await getMe();
        if (active) setUser(currentUser);
      } catch {
        logout();
        clearOrg();
        clearVaultSyncStorage();
      } finally {
        if (active) setChecking(false);
      }
    }

    validateSession();
    return () => {
      active = false;
    };
  }, [accessToken, user, setUser, logout, clearOrg]);

  if (!accessToken) return <Navigate to="/login" replace />;
  if (checking) return null;
  return <Outlet />;
}
