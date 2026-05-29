import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApplication } from '../api/applications.api.js';
import { listBackups } from '../api/backups.api.js';
import { listLogs } from '../api/logs.api.js';
import Badge from '../components/ui/Badge.jsx';
import { Card, CardTitle } from '../components/ui/Card.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [state, setState] = useState({ app: null, backups: [], logs: [], loading: true });

  useEffect(() => {
    let active = true;
    async function load() {
      const [app, backups, logs] = await Promise.all([getApplication(id), listBackups({ appId: id, limit: 10 }), listLogs({ appId: id, limit: 50 })]);
      if (active) setState({ app, backups: backups.items, logs: logs.items, loading: false });
    }
    load();
    const timer = setInterval(load, 30000);
    return () => { active = false; clearInterval(timer); };
  }, [id]);

  if (state.loading) return <Skeleton className="h-96 w-full" />;
  const percent = Math.min(100, ((state.app.usedGb || 0) / state.app.storageLimitGb) * 100);

  return (
    <div className="space-y-5">
      <Card><CardTitle>{state.app.appName}</CardTitle><div className="mt-3 grid gap-2 text-sm md:grid-cols-3"><p>Host: {state.app.dbHost}</p><p>Database: {state.app.dbName}</p><p>Schedule: {state.app.backupFrequency}</p></div><div className="mt-4 h-3 rounded-full bg-gray-200 dark:bg-gray-800"><div className="h-3 rounded-full bg-ocean" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-sm">{Number(state.app.usedGb || 0).toFixed(2)} / {state.app.storageLimitGb} GB</p></Card>
      <Card><CardTitle>Backup History</CardTitle><table className="mt-4 w-full text-left text-sm"><thead><tr className="border-b dark:border-gray-800"><th className="py-2">File</th><th>Status</th><th>Created</th></tr></thead><tbody>{state.backups.map((backup) => <tr key={backup.id} className="border-b dark:border-gray-800"><td className="py-2">{backup.fileName}</td><td><Badge>{backup.status}</Badge></td><td>{format(new Date(backup.createdAt), 'PPpp')}</td></tr>)}</tbody></table></Card>
      <Card><CardTitle>Log Feed</CardTitle><div className="mt-4 space-y-2">{state.logs.map((log) => <div key={log.id} className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-800"><div className="flex items-center justify-between"><Badge>{log.level}</Badge><span className="text-xs text-gray-500">{format(new Date(log.createdAt), 'PPpp')}</span></div><p className="mt-2">{log.message}</p></div>)}</div></Card>
    </div>
  );
}
