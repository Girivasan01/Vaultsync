import { useState, useEffect, useCallback } from 'react';
import Badge from '../components/ui/Badge.jsx';
import { Card, CardTitle } from '../components/ui/Card.jsx';
import { listLogs } from '../api/logs.api.js';
import OrgSelectWarning from '../components/ui/OrgSelectWarning.jsx';
import { useOrgStore } from '../store/org.store.js';

export default function LogsPage() {
  const { activeOrgId, activeOrgName, activeEnterpriseId, activeEnterpriseName } = useOrgStore();
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [logs, setLogs] = useState([]);

  const load = useCallback(async () => {
    try {
      const data = await listLogs({
        ...filters,
        orgId: activeOrgId || undefined,
        enterpriseId: activeEnterpriseId || undefined,
      });
      setLogs(data.items);
    } catch {
      setLogs([]);
    }
  }, [JSON.stringify(filters), activeOrgId, activeEnterpriseId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Logs</h1>
        {activeOrgName && (
          <p className="text-sm text-gray-500">Organisation: {activeOrgName}</p>
        )}
        {activeEnterpriseName && (
          <p className="text-sm text-gray-500">Enterprise: {activeEnterpriseName}</p>
        )}
      </div>

      {!activeOrgId && (
        <OrgSelectWarning message="Select an organisation from the sidebar to view its logs." />
      )}

      <Card>
        <CardTitle>Filters</CardTitle>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            placeholder="Application ID"
            className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
            onChange={(e) => setFilters((f) => ({ ...f, appId: e.target.value || undefined }))}
          />
          <select
            className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
            onChange={(e) => setFilters((f) => ({ ...f, level: e.target.value || undefined }))}
          >
            <option value="">Any level</option>
            <option>INFO</option>
            <option>WARN</option>
            <option>ERROR</option>
            <option>SUCCESS</option>
          </select>
          <input
            type="date"
            className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value || undefined }))}
          />
          <input
            type="date"
            className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value || undefined }))}
          />
        </div>
      </Card>

      <Card>
        <CardTitle>Backup Logs</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th className="py-2">Timestamp</th>
                <th>App</th>
                <th>Level</th>
                <th>Message</th>
                <th>Meta</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b align-top dark:border-gray-800">
                  <td className="py-2">{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.application?.appName}</td>
                  <td><Badge>{log.level}</Badge></td>
                  <td>{log.message}</td>
                  <td>
                    <details>
                      <summary className="cursor-pointer text-ocean">View</summary>
                      <pre className="mt-2 max-w-sm overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}