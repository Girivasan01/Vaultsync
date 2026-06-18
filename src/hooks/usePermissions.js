import { useMemo } from 'react';
import { useAuthStore } from '../store/auth.store.js';
import { useOrgStore } from '../store/org.store.js';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const { activeEnterpriseId } = useOrgStore();

  return useMemo(() => {
    const isPlatformAdmin = Boolean(user?.isPlatformAdmin ?? user?.role === 'ADMIN');
    const enterprises = user?.enterprises || [];
    const membership = enterprises.find(
      (item) => Number(item.enterpriseId) === Number(activeEnterpriseId),
    ) || enterprises[0];

    const isEnterpriseAdmin = membership?.role === 'ENTERPRISE_ADMIN';
    const isStaff = membership?.role === 'STAFF';

    return {
      isPlatformAdmin,
      isEnterpriseAdmin,
      isStaff,
      membership,
      enterprises,
      canManageEnterprises: isPlatformAdmin,
      canManageOrgs: isPlatformAdmin,
      canManageApplications: isPlatformAdmin || isEnterpriseAdmin,
      canManageEnterpriseUsers: isPlatformAdmin || isEnterpriseAdmin,
      canDeleteBackups: isPlatformAdmin || isEnterpriseAdmin,
      canTriggerBackup: isPlatformAdmin || isEnterpriseAdmin || isStaff,
    };
  }, [user, activeEnterpriseId]);
}
