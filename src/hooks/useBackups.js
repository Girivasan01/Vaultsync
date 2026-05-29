import { useCallback, useEffect, useState } from 'react';
import { listBackups } from '../api/backups.api.js';

export function useBackups(params = {}) {
  const [data, setData] = useState({ items: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setData(await listBackups(params));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);
  useEffect(() => { load(); }, [load]);
  return { ...data, loading, reload: load };
}
