import { Check, Database, Pencil, Play, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { backupNow, createApplication, deleteApplication, testConnection, updateApplication } from '../api/applications.api.js';
import ApplicationForm from '../components/forms/ApplicationForm.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { Card, CardTitle } from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';
import StatusDot from '../components/ui/StatusDot.jsx';
import { useApplications } from '../hooks/useApplications.js';

export default function ApplicationsPage() {
  const { items, reload } = useApplications();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmName, setConfirmName] = useState('');

  const save = async (payload) => {
    try {
      if (editing?.id) await updateApplication(editing.id, payload); else await createApplication(payload);
      toast.success('Application saved');
      setEditing(null);
      await reload();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Save failed');
    }
  };

  const remove = async () => {
    if (confirmName !== deleting.appName) return toast.error('Type the application name to confirm');
    await deleteApplication(deleting.id);
    toast.success('Application deleted');
    setDeleting(null);
    setConfirmName('');
    await reload();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Applications</h1><Button onClick={() => setEditing({})}><Database className="h-4 w-4" /> Add Application</Button></div>
      <Card>
        <CardTitle>Registered Databases</CardTitle>
        <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm">
          <thead><tr className="border-b dark:border-gray-800"><th className="py-2">App Name</th><th>DB Host</th><th>DB Name</th><th>Storage</th><th>Schedule</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{items.map((app) => <tr key={app.id} className="border-b dark:border-gray-800"><td className="py-2"><Link className="font-medium text-ocean" to={`/applications/${app.id}`}>{app.appName}</Link></td><td>{app.dbHost}</td><td>{app.dbName}</td><td>{Number(app.usedGb || 0).toFixed(2)} / {app.storageLimitGb} GB</td><td>{app.backupFrequency}</td><td><span className="inline-flex items-center gap-2"><StatusDot active={app.isActive} />{app.isActive ? 'Active' : 'Paused'}</span></td><td className="flex flex-wrap gap-2 py-2"><Button variant="secondary" onClick={() => setEditing(app)}><Pencil className="h-4 w-4" /></Button><Button variant="secondary" onClick={async () => { try { await testConnection(app.id); toast.success('Connection successful', { icon: <Check /> }); } catch (error) { toast.error(error.response?.data?.error || 'Connection failed', { icon: <X /> }); } }}>Test</Button><Button variant="secondary" onClick={async () => { await backupNow(app.id); toast.success('Backup enqueued'); }}><Play className="h-4 w-4" /></Button><Button variant="danger" onClick={() => setDeleting(app)}><Trash2 className="h-4 w-4" /></Button></td></tr>)}</tbody>
        </table></div>
      </Card>
      <Modal open={Boolean(editing)} title={editing?.id ? 'Edit Application' : 'Add Application'} onClose={() => setEditing(null)} onConfirm={() => document.querySelector('#application-submit')?.click()}><ApplicationForm initialValues={editing} onSubmit={save} onCancel={() => setEditing(null)} /><button id="application-submit" type="submit" hidden /></Modal>
      <Modal open={Boolean(deleting)} title="Delete Application" danger confirmLabel="Delete" onClose={() => setDeleting(null)} onConfirm={remove}><p className="mb-3 text-sm">Type <Badge>{deleting?.appName}</Badge> to confirm deletion.</p><input className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950" value={confirmName} onChange={(event) => setConfirmName(event.target.value)} /></Modal>
    </div>
  );
}
