import { useCallback, useEffect, useState } from 'react';
import { getActivityChart, getRecentBackups, getStats, getStorageChart } from '../api/dashboard.api.js';

export function useDashboard(orgId = null, enterpriseId = null) {
  const [state, setState] = useState({ stats: {}, storage: [], activity: [], recent: [], loading: true });

  const load = useCallback(async () => {
    try {
      setState((current) => ({ ...current, loading: true }));
      const params = {};
      if (orgId) params.orgId = orgId;
      if (enterpriseId) params.enterpriseId = enterpriseId;
      const [stats, storage, activity, recent] = await Promise.all([
        getStats(params),
        getStorageChart(params),
        getActivityChart(params),
        getRecentBackups(params)
      ]);
      setState({ stats, storage, activity, recent, loading: false });
    } catch {
      setState((current) => ({ ...current, loading: false }));
    }
  }, [orgId, enterpriseId]);

  useEffect(() => { load(); }, [load]);

  return { ...state, reload: load };
}
