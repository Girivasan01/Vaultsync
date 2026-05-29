import { useCallback, useEffect, useState } from 'react';
import { listApplications } from '../api/applications.api.js';

export function useApplications(params = {}) {
  const [data, setData] = useState({ items: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setData(await listApplications(params));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);
  useEffect(() => { load(); }, [load]);
  return { ...data, loading, reload: load };
}
