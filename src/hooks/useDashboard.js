import { useCallback, useEffect, useState } from 'react';
import { getActivityChart, getRecentBackups, getStats, getStorageChart } from '../api/dashboard.api.js';

export function useDashboard() {
  const [state, setState] = useState({ stats: null, storage: [], activity: [], recent: [], loading: true });
  const load = useCallback(async () => {
    try {
      setState((current) => ({ ...current, loading: true }));
      const [stats, storage, activity, recent] = await Promise.all([getStats(), getStorageChart(), getActivityChart(), getRecentBackups()]);
      setState({ stats, storage, activity, recent, loading: false });
    } catch (error) {
      setState((current) => ({ ...current, loading: false }));
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
