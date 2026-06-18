import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { createOrg, deleteOrg, updateOrg } from '../../api/orgs.api.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { Card, CardTitle } from '../../components/ui/Card.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useOrgs } from '../../hooks/useOrgs.js';

export default function OrgsPage() {
  const { orgs, reload } = useOrgs();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '' });

  const openCreate = () => { setForm({ name: '', slug: '' }); setEditing({}); };
  const openEdit = (org) => { setForm({ name: org.name, slug: org.slug }); setEditing(org); };

  const save = async () => {
    try {
      if (editing?.id) await updateOrg(editing.id, form);
      else await createOrg(form);
      toast.success('Organisation saved');
      setEditing(null);
      await reload();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Save failed');
    }
  };

  const remove = async () => {
    try {
      await deleteOrg(deleting.id);
      toast.success('Organisation deleted');
      setDeleting(null);
      await reload();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organisations</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New Organisation</Button>
      </div>

      <Card>
        <CardTitle>All Organisations</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th className="py-2">Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b dark:border-gray-800">
                  <td className="py-2 font-medium">{org.name}</td>
                  <td className="font-mono text-xs text-gray-500">{org.slug}</td>
                  <td><Badge>{org.isActive ? 'Active' : 'Inactive'}</Badge></td>
                  <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                  <td className="flex gap-2 py-2">
                    <Button variant="secondary" onClick={() => openEdit(org)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="danger" onClick={() => setDeleting(org)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? 'Edit Organisation' : 'New Organisation'}
        onClose={() => setEditing(null)}
        onConfirm={save}
      >
        <div className="space-y-3">
          <label className="block space-y-1 text-sm">
            Name
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="block space-y-1 text-sm">
            Slug <span className="text-xs text-gray-400">(lowercase, hyphens only)</span>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono dark:border-gray-700 dark:bg-gray-950"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        title="Delete Organisation"
        danger
        confirmLabel="Delete"
        onClose={() => setDeleting(null)}
        onConfirm={remove}
      >
        <p className="text-sm">Delete <strong>{deleting?.name}</strong>? All applications and backups under this org will also be deleted.</p>
      </Modal>
    </div>
  );
}
