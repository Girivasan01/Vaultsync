import { formatDistanceToNow } from 'date-fns';
import BackupActivityChart from '../components/charts/BackupActivityChart.jsx';
import StorageBarChart from '../components/charts/StorageBarChart.jsx';
import Badge from '../components/ui/Badge.jsx';
import { Card, CardTitle } from '../components/ui/Card.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useDashboard } from '../hooks/useDashboard.js';

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!value) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / (1024 ** index)).toFixed(index ? 2 : 0)} ${units[index]}`;
}

export default function DashboardPage() {
  const { stats, storage, activity, recent, loading } = useDashboard();
  if (loading) return <Skeleton className="h-96 w-full" />;

  const cards = [
    ['Total Applications', stats.totalApplications],
    ['Total Backups', stats.totalBackups],
    ['Total Storage Used', formatBytes(stats.totalStorageBytes)],
    ['Failed Jobs (24h)', stats.failedJobs]
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">{cards.map(([label, value]) => <Card key={label}><p className="text-sm text-gray-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>)}</div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card><CardTitle>Storage Usage</CardTitle><StorageBarChart data={storage} /></Card>
        <Card><CardTitle>Backup Activity</CardTitle><BackupActivityChart data={activity} /></Card>
      </div>
      <Card>
        <CardTitle>Recent Backups</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b dark:border-gray-800"><th className="py-2">App Name</th><th>File</th><th>Size</th><th>Status</th><th>Triggered By</th><th>Time</th></tr></thead>
            <tbody>{recent.map((backup) => <tr key={backup.id} className="border-b dark:border-gray-800"><td className="py-2">{backup.application?.appName}</td><td>{backup.fileName}</td><td>{formatBytes(backup.sizeBytes)}</td><td><Badge>{backup.status}</Badge></td><td><Badge>{backup.triggeredBy}</Badge></td><td>{formatDistanceToNow(new Date(backup.createdAt), { addSuffix: true })}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
