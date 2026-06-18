import { useCallback, useEffect, useState } from 'react';
import { listApplications } from '../api/applications.api.js';

export function useApplications({ orgId, enterpriseId } = {}) {
  const [data, setData] = useState({ items: [], pagination: {} });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (orgId) params.orgId = orgId;
      if (enterpriseId) params.enterpriseId = enterpriseId;
      setData(await listApplications(params));
    } catch {
      setData({ items: [], pagination: {} });
    } finally {
      setLoading(false);
    }
  }, [orgId, enterpriseId]);

  useEffect(() => { load(); }, [load]);

  return { ...data, loading, reload: load };
}