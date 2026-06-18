import { Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { deleteBackup, getDownloadLink } from '../api/backups.api.js';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { Card, CardTitle } from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';
import OrgSelectWarning from '../components/ui/OrgSelectWarning.jsx';
import { useBackups } from '../hooks/useBackups.js';
import { usePermissions } from '../hooks/usePermissions.js';
import { useOrgStore } from '../store/org.store.js';

export default function BackupsPage() {
  const { canDeleteBackups } = usePermissions();
  const { activeOrgId, activeOrgName, activeEnterpriseId, activeEnterpriseName } = useOrgStore();
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [deleting, setDeleting] = useState(null);

  const { items, reload } = useBackups({
    ...filters,
    orgId: activeOrgId || undefined,
    enterpriseId: activeEnterpriseId || undefined,
  });

  const remove = async () => {
    await deleteBackup(deleting.id);
    toast.success('Backup deleted');
    setDeleting(null);
    await reload();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Backups</h1>
        {activeOrgName && (
          <p className="text-sm text-gray-500">Organisation: {activeOrgName}</p>
        )}
        {activeEnterpriseName && (
          <p className="text-sm text-gray-500">Enterprise: {activeEnterpriseName}</p>
        )}
      </div>

      {!activeOrgId && (
        <OrgSelectWarning message="Select an organisation from the sidebar to view its backups." />
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
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || undefined }))}
          >
            <option value="">Any status</option>
            <option>SUCCESS</option>
            <option>FAILED</option>
            <option>DELETED</option>
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
        <CardTitle>Backup Files</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th className="py-2">App</th>
                <th>File Name</th>
                <th>Size</th>
                <th>Status</th>
                <th>Triggered By</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((backup) => (
                <tr key={backup.id} className="border-b dark:border-gray-800">
                  <td className="py-2">{backup.application?.appName}</td>
                  <td>{backup.fileName}</td>
                  <td>{backup.sizeBytes}</td>
                  <td><Badge>{backup.status}</Badge></td>
                  <td><Badge>{backup.triggeredBy}</Badge></td>
                  <td>{new Date(backup.createdAt).toLocaleString()}</td>
                  <td className="flex gap-2 py-2">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        const link = await getDownloadLink(backup.id);
                        window.open(link.url, '_blank');
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {canDeleteBackups && (
                      <Button variant="danger" onClick={() => setDeleting(backup)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={Boolean(deleting)}
        title="Delete Backup"
        danger
        confirmLabel="Delete"
        onClose={() => setDeleting(null)}
        onConfirm={remove}
      >
        <p className="text-sm">Delete {deleting?.fileName} from MEGA and mark it deleted?</p>
      </Modal>
    </div>
  );
}