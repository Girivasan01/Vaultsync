import { useState } from 'react';
import Badge from '../components/ui/Badge.jsx';
import { Card, CardTitle } from '../components/ui/Card.jsx';
import { listLogs } from '../api/logs.api.js';
import { useEffect } from 'react';

export default function LogsPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    async function load() {
      const data = await listLogs(filters);
      setLogs(data.items);
    }
    load();
  }, [JSON.stringify(filters)]);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Logs</h1>
      <Card><CardTitle>Filters</CardTitle><div className="mt-4 grid gap-3 md:grid-cols-4"><input placeholder="Application ID" className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-950" onChange={(event) => setFilters((current) => ({ ...current, appId: event.target.value || undefined }))} /><select className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-950" onChange={(event) => setFilters((current) => ({ ...current, level: event.target.value || undefined }))}><option value="">Any level</option><option>INFO</option><option>WARN</option><option>ERROR</option><option>SUCCESS</option></select><input type="date" className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-950" onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value || undefined }))} /><input type="date" className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-950" onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value || undefined }))} /></div></Card>
      <Card><CardTitle>Backup Logs</CardTitle><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b dark:border-gray-800"><th className="py-2">Timestamp</th><th>App</th><th>Level</th><th>Message</th><th>Meta</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-b align-top dark:border-gray-800"><td className="py-2">{new Date(log.createdAt).toLocaleString()}</td><td>{log.application?.appName}</td><td><Badge>{log.level}</Badge></td><td>{log.message}</td><td><details><summary className="cursor-pointer text-ocean">View</summary><pre className="mt-2 max-w-sm overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">{JSON.stringify(log.meta, null, 2)}</pre></details></td></tr>)}</tbody></table></div></Card>
    </div>
  );
}
