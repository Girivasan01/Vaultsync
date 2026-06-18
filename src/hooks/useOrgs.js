import { useEffect, useState, useCallback } from 'react';
import { listOrgs } from '../api/orgs.api.js';

export function useOrgs() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listOrgs();
      setOrgs(data);
    } catch {
      setOrgs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { orgs, loading, reload: load };
}
