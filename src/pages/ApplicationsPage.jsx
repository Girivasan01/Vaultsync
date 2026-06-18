import { Check, Database, Pencil, Play, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import {
  backupNow,
  createApplication,
  deleteApplication,
  testConnection,
  updateApplication,
} from "../api/applications.api.js";
import { listEnterprises } from "../api/enterprises.api.js";
import ApplicationForm from "../components/forms/ApplicationForm.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { Card, CardTitle } from "../components/ui/Card.jsx";
import Modal from "../components/ui/Modal.jsx";
import OrgSelectWarning from "../components/ui/OrgSelectWarning.jsx";
import StatusDot from "../components/ui/StatusDot.jsx";
import { useApplications } from "../hooks/useApplications.js";
import { usePermissions } from "../hooks/usePermissions.js";
import { useOrgStore } from "../store/org.store.js";

export default function ApplicationsPage() {
  const { canManageApplications, canTriggerBackup } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    activeOrgId,
    activeOrgName,
    activeEnterpriseId,
    activeEnterpriseName,
  } = useOrgStore();
  const { items, reload } = useApplications({
    orgId: activeOrgId,
    enterpriseId: activeEnterpriseId,
  });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmName, setConfirmName] = useState("");
  const [enterprises, setEnterprises] = useState([]);

  useEffect(() => {
    if (activeOrgId) {
      listEnterprises(activeOrgId)
        .then(setEnterprises)
        .catch(() => setEnterprises([]));
    } else {
      setEnterprises([]);
    }
  }, [activeOrgId]);

  useEffect(() => {
    if (searchParams.get("add") === "1" && activeOrgId) {
      setEditing({
        enterpriseId: activeEnterpriseId || undefined,
      });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, activeOrgId, activeEnterpriseId, setSearchParams]);

  const save = async (payload) => {
    try {
      const enterpriseId = Number(payload.enterpriseId || activeEnterpriseId);
      if (!enterpriseId) {
        return toast.error("Select an enterprise for this application");
      }
      const data = {
        ...payload,
        ...(activeOrgId ? { orgId: activeOrgId } : {}),
        enterpriseId,
      };
      if (editing?.id) await updateApplication(editing.id, data);
      else await createApplication(data);
      toast.success("Application saved");
      setEditing(null);
      await reload();
    } catch (error) {
      toast.error(error.response?.data?.error || "Save failed");
    }
  };

  const remove = async () => {
    if (confirmName !== deleting.appName)
      return toast.error("Type the application name to confirm");
    try {
      await deleteApplication(deleting.id);
      toast.success("Application deleted");
      setDeleting(null);
      setConfirmName("");
      await reload();
    } catch (error) {
      toast.error(error.response?.data?.error || "Delete failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          {activeOrgName && (
            <p className="text-sm text-gray-500">
              Organisation: {activeOrgName}
            </p>
          )}
          {activeEnterpriseName && (
            <p className="text-sm text-gray-500">
              Enterprise: {activeEnterpriseName}
            </p>
          )}
        </div>
        {canManageApplications && (
          <Button
            onClick={() =>
              setEditing({ enterpriseId: activeEnterpriseId || undefined })
            }
            disabled={!activeOrgId}
            title={!activeOrgId ? "Select an organisation first" : ""}
          >
            <Database className="h-4 w-4" /> Add Application
          </Button>
        )}
      </div>

      {!activeOrgId && (
        <OrgSelectWarning message="Select an organisation from the sidebar to view and manage its applications." />
      )}

      <Card>
        <CardTitle>Registered Databases</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th className="py-2">App Name</th>
                <th>Enterprise</th>
                <th>DB Host</th>
                <th>DB Name</th>
                <th>Storage</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-sm text-gray-400">
                    No applications found
                    {activeOrgName ? ` for ${activeOrgName}` : ""}
                    {activeEnterpriseName ? ` / ${activeEnterpriseName}` : ""}.
                  </td>
                </tr>
              )}
              {items.map((app) => (
                <tr key={app.id} className="border-b dark:border-gray-800">
                  <td className="py-2">
                    <Link
                      className="font-medium text-ocean"
                      to={`/applications/${app.id}`}
                    >
                      {app.appName}
                    </Link>
                  </td>
                  <td className="text-gray-500 text-sm">
                    {app.enterpriseName ||
                      enterprises.find((e) => e.id === app.enterpriseId)
                        ?.enterprise || (
                        <span className="text-gray-300">—</span>
                      )}
                  </td>
                  <td>{app.dbHost}</td>
                  <td>{app.dbName}</td>
                  <td>
                    {Number(app.usedGb || 0).toFixed(2)} / {app.storageLimitGb}{" "}
                    GB
                  </td>
                  <td>{app.backupFrequency}</td>
                  <td>
                    <span className="inline-flex items-center gap-2">
                      <StatusDot active={app.isActive} />
                      {app.isActive ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="flex flex-wrap gap-2 py-2">
                    {canManageApplications && (
                      <Button variant="secondary" onClick={() => setEditing(app)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await testConnection(app.id);
                          toast.success("Connection successful", {
                            icon: <Check />,
                          });
                        } catch (error) {
                          toast.error(
                            error.response?.data?.error || "Connection failed",
                            { icon: <X /> },
                          );
                        }
                      }}
                    >
                      Test
                    </Button>
                    {canTriggerBackup && (
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          await backupNow(app.id);
                          toast.success("Backup enqueued");
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    {canManageApplications && (
                      <Button variant="danger" onClick={() => setDeleting(app)}>
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
        open={Boolean(editing)}
        title={editing?.id ? "Edit Application" : "Add Application"}
        onClose={() => setEditing(null)}
        hideFooter
        closeOnBackdrop={false}
      >
        <ApplicationForm
          key={editing?.id || `new-${editing?.enterpriseId ?? "none"}`}
          initialValues={editing}
          enterprises={enterprises}
          onSubmit={save}
          onCancel={() => setEditing(null)}
        />
      </Modal>

      <Modal
        open={Boolean(deleting)}
        title="Delete Application"
        danger
        confirmLabel="Delete"
        onClose={() => setDeleting(null)}
        onConfirm={remove}
      >
        <p className="mb-3 text-sm">
          Type <Badge>{deleting?.appName}</Badge> to confirm deletion.
        </p>
        <input
          className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
        />
      </Modal>
    </div>
  );
}
