import {
  AlertTriangle,
  Database,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  createEnterprise,
  createEnterpriseUser,
  deleteEnterprise,
  deleteEnterpriseUser,
  listEnterpriseUsers,
  listEnterprises,
  updateSubscription,
  syncHotelEnterprise,
} from "../../api/enterprises.api.js";
import { usePermissions } from "../../hooks/usePermissions.js";
import { listOrgs } from "../../api/orgs.api.js";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import { Card, CardTitle } from "../../components/ui/Card.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Tooltip from "../../components/ui/Tooltip.jsx";
import { useOrgStore } from "../../store/org.store.js";

const thClass =
  "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
const tdClass = "px-3 py-2.5 align-middle text-sm";

function ExpiryCell({ row }) {
  if (!row.expiry_date)
    return <span className="text-gray-400 text-sm">Not set</span>;
  const [y, m, d] = row.expiry_date.split("-").map(Number);
  const expiry = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const label =
    days < 0 ? "Expired" : days === 0 ? "Expires today!" : `${days} days left`;
  const color =
    row.warningLevel === "critical" || row.warningLevel === "expired"
      ? "text-red-500"
      : row.warningLevel === "warning"
        ? "text-yellow-500"
        : "text-green-500";
  return <span className={`text-sm font-medium ${color}`}>{label}</span>;
}

function WarningCell({ level }) {
  if (level === "expired")
    return (
      <span className="flex items-center gap-1 text-red-500 text-sm">
        <AlertTriangle className="h-3 w-3" /> Expired
      </span>
    );
  if (level === "critical")
    return (
      <span className="flex items-center gap-1 text-red-500 text-sm">
        <AlertTriangle className="h-3 w-3" /> Expires soon!
      </span>
    );
  if (level === "warning")
    return (
      <span className="flex items-center gap-1 text-yellow-500 text-sm">
        <AlertTriangle className="h-3 w-3" /> Within 1 month
      </span>
    );
  return <span className="text-green-500 text-sm">OK</span>;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EnterprisesPage() {
  const navigate = useNavigate();
  const {
    canManageEnterprises,
    canManageApplications,
    canManageEnterpriseUsers,
    isPlatformAdmin,
    enterprises: userEnterprises,
  } = usePermissions();

  const canManageUsersForEnt = (ent) => {
    if (isPlatformAdmin) return true;
    if (!canManageEnterpriseUsers) return false;
    return userEnterprises.some(
      (item) =>
        Number(item.enterpriseId) === Number(ent.id) &&
        item.role === "ENTERPRISE_ADMIN",
    );
  };
  const { activeOrgId, activeOrgName, setActiveOrg, setActiveEnterprise } =
    useOrgStore();
  const [enterprises, setEnterprises] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [expiryTarget, setExpiryTarget] = useState(null);
  const [expiryDate, setExpiryDate] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    enterprise: "",
    orgId: "",
    start_date: today,
    expiry_date: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
  });
  const [showCriticalBanner, setShowCriticalBanner] = useState(true);
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const [usersTarget, setUsersTarget] = useState(null);
  const [enterpriseUsers, setEnterpriseUsers] = useState([]);
  const [userForm, setUserForm] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [removingUser, setRemovingUser] = useState(null);

  const load = async () => {
    const ents = await listEnterprises(activeOrgId || undefined);
    setEnterprises(ents);
    setShowCriticalBanner(true);
    setShowWarningBanner(true);
    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem("enterprise_warning_shown");
    if (lastShown !== today) {
      ents.forEach((e) => {
        if (e.warningLevel === "critical" || e.warningLevel === "expired") {
          toast.error(
            `⚠️ ${e.enterprise} expires on ${e.expiry_date}! Less than 1 week left!`,
            { duration: 8000 },
          );
        } else if (e.warningLevel === "warning") {
          toast(
            `ℹ️ ${e.enterprise} expires on ${e.expiry_date}. Less than 1 month left.`,
            { duration: 6000 },
          );
        }
      });
      if (ents.some((e) => e.warningLevel))
        localStorage.setItem("enterprise_warning_shown", today);
    }
  };

  useEffect(() => {
    listOrgs()
      .then(setOrgs)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [activeOrgId]);

  const save = async () => {
    if (!form.enterprise.trim())
      return toast.error("Enterprise name is required");
    const orgId = form.orgId || activeOrgId;
    if (!orgId) return toast.error("Organisation is required");
    if (!form.start_date) return toast.error("Start date is required");
    if (!form.expiry_date) return toast.error("Expiry date is required");
    if (form.expiry_date < form.start_date) {
      return toast.error("Expiry date cannot be before start date");
    }
    if (!form.admin_name.trim()) return toast.error("Admin name is required");
    if (!form.admin_email.trim()) return toast.error("Admin email is required");
    if (!form.admin_password || form.admin_password.length < 6) {
      return toast.error("Admin password must be at least 6 characters");
    }

    try {
      await createEnterprise({ ...form, orgId });
      toast.success("Enterprise and admin user created");
      setAdding(false);
      setForm({
        enterprise: "",
        orgId: "",
        start_date: new Date().toISOString().slice(0, 10),
        expiry_date: "",
        admin_name: "",
        admin_email: "",
        admin_password: "",
      });
      await load();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create enterprise");
    }
  };

  const toggleActive = async (ent) => {
    try {
      await updateSubscription(ent.id, !ent.isActive);
      toast.success("Subscription updated");
      await load();
    } catch {
      toast.error("Failed to update subscription");
    }
  };

  const saveExpiry = async () => {
    if (!expiryDate) return toast.error("Please choose an expiry date");
    try {
      await updateSubscription(
        expiryTarget.id,
        expiryTarget.isActive,
        expiryDate,
      );
      toast.success("Expiry date saved");
      setExpiryTarget(null);
      setExpiryDate("");
      await load();
    } catch {
      toast.error("Failed to save expiry date");
    }
  };

  const remove = async () => {
    try {
      await deleteEnterprise(deleting.id);
      toast.success("Enterprise deleted");
      setDeleting(null);
      await load();
    } catch {
      toast.error("Failed to delete enterprise");
    }
  };

  const openUsers = async (ent) => {
    setUsersTarget(ent);
    setUserForm({ email: "", name: "", password: "" });
    try {
      setEnterpriseUsers(await listEnterpriseUsers(ent.id));
    } catch {
      setEnterpriseUsers([]);
      toast.error("Failed to load enterprise users");
    }
  };

  const addEnterpriseUser = async () => {
    if (!userForm.name.trim()) return toast.error("Staff name is required");
    if (!userForm.email.trim()) return toast.error("Staff email is required");
    if (!userForm.password || userForm.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      await createEnterpriseUser(usersTarget.id, {
        ...userForm,
        role: "STAFF",
      });
      toast.success("Staff user added");
      setUserForm({ email: "", name: "", password: "" });
      setEnterpriseUsers(await listEnterpriseUsers(usersTarget.id));
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add staff user");
    }
  };

  const syncHotel = async (ent) => {
    try {
      await syncHotelEnterprise(ent.id);
      toast.success(`Hotel users synced to enterprise ID ${ent.id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "Hotel sync failed — add an Application first",
      );
    }
  };

  const removeEnterpriseUserRow = async () => {
    try {
      await deleteEnterpriseUser(usersTarget.id, removingUser.id);
      toast.success("User removed");
      setRemovingUser(null);
      setEnterpriseUsers(await listEnterpriseUsers(usersTarget.id));
    } catch {
      toast.error("Failed to remove user");
    }
  };

  const handleAddApplication = (ent) => {
    const orgForEnt = orgs.find((o) => o.id === (ent.orgId || ent.org_id));
    if (orgForEnt) {
      setActiveOrg({ id: orgForEnt.id, name: orgForEnt.name });
    }
    setActiveEnterprise({ id: ent.id, name: ent.enterprise });
    navigate("/applications?add=1");
  };

  const expiredCount = enterprises.filter(
    (e) => e.warningLevel === "expired",
  ).length;
  const criticalCount = enterprises.filter(
    (e) => e.warningLevel === "critical",
  ).length;
  const warningCount = enterprises.filter(
    (e) => e.warningLevel === "warning",
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Enterprises</h1>
          {activeOrgName && (
            <p className="text-sm text-gray-500">
              Organisation: {activeOrgName}
            </p>
          )}
        </div>
        {canManageEnterprises && (
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add Enterprise
          </Button>
        )}
      </div>

      {(expiredCount > 0 || criticalCount > 0) && showCriticalBanner && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {expiredCount > 0 && (
              <>
                {expiredCount} enterprise{expiredCount > 1 ? "s" : ""} expired —
                renew immediately!{" "}
              </>
            )}
            {criticalCount > 0 && (
              <>
                {criticalCount} enterprise{criticalCount > 1 ? "s" : ""}{" "}
                expiring within 1 week!
              </>
            )}
          </span>
          <button
            onClick={() => setShowCriticalBanner(false)}
            className="shrink-0 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {warningCount > 0 && showWarningBanner && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {warningCount} enterprise{warningCount > 1 ? "s" : ""} expiring
            within 1 month.
          </span>
          <button
            onClick={() => setShowWarningBanner(false)}
            className="shrink-0 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <CardTitle>All Enterprises</CardTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className={`${thClass} w-10`}>ID</th>
                <th className={`${thClass} w-36`}>Enterprise</th>
                <th className={`${thClass} w-36`}>Organisation</th>
                <th className={`${thClass} w-20`}>Status</th>
                <th className={`${thClass} w-24`}>Start</th>
                <th className={`${thClass} w-24`}>Expiry</th>
                <th className={`${thClass} w-24`}>Days Left</th>
                <th className={`${thClass} w-28`}>Warning</th>
                <th className={`${thClass} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {enterprises.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-sm text-gray-400"
                  >
                    No enterprises found
                    {activeOrgName ? ` for ${activeOrgName}` : ""}.
                  </td>
                </tr>
              )}
              {enterprises.map((ent) => (
                <tr
                  key={ent.id}
                  className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-900/30"
                >
                  <td className={`${tdClass} font-mono text-xs text-gray-500`}>
                    {ent.id}
                  </td>
                  <td
                    className={`${tdClass} font-semibold text-gray-900 dark:text-white`}
                  >
                    {ent.enterprise}
                  </td>
                  <td className={`${tdClass} text-gray-500`}>
                    {ent.orgName || ent.orgId}
                  </td>
                  <td className={tdClass}>
                    {canManageEnterprises ? (
                      <button type="button" onClick={() => toggleActive(ent)}>
                        <Badge>{ent.isActive ? "Active" : "Inactive"}</Badge>
                      </button>
                    ) : (
                      <Badge>{ent.isActive ? "Active" : "Inactive"}</Badge>
                    )}
                  </td>
                  <td
                    className={`${tdClass} whitespace-nowrap text-gray-600 dark:text-gray-300`}
                  >
                    {formatDisplayDate(ent.start_date)}
                  </td>
                  <td
                    className={`${tdClass} whitespace-nowrap text-gray-600 dark:text-gray-300`}
                  >
                    {formatDisplayDate(ent.expiry_date)}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    <ExpiryCell row={ent} />
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    <WarningCell level={ent.warningLevel} />
                  </td>
                  <td className={`${tdClass}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      {canManageApplications && (
                        <Tooltip content="Add application">
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1.5"
                            onClick={() => handleAddApplication(ent)}
                          >
                            <span className="text-xs font-medium">
                              Application
                            </span>
                          </Button>
                        </Tooltip>
                      )}
                      {canManageUsersForEnt(ent) && (
                        <Tooltip content="Create user">
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1.5"
                            onClick={() => openUsers(ent)}
                          >
                            <span className="text-xs font-medium">Users</span>
                          </Button>
                        </Tooltip>
                      )}
                      {(canManageEnterprises || canManageUsersForEnt(ent)) && (
                        <Tooltip content="Sync">
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1.5"
                            onClick={() => syncHotel(ent)}
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </Tooltip>
                      )}
                      {canManageEnterprises && (
                        <Tooltip content="Set expiry">
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1.5"
                            onClick={() => {
                              setExpiryTarget(ent);
                              setExpiryDate(ent.expiry_date || "");
                            }}
                          >
                            <span className="text-xs font-medium">Expiry</span>
                          </Button>
                        </Tooltip>
                      )}
                      {canManageEnterprises && (
                        <Tooltip content="Delete">
                          <Button
                            variant="danger"
                            className="!px-2 !py-1.5"
                            onClick={() => setDeleting(ent)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Enterprise modal */}
      <Modal
        open={adding}
        title="Add Enterprise"
        onClose={() => setAdding(false)}
        onConfirm={save}
      >
        <div className="space-y-3">
          <label className="block space-y-1 text-sm">
            Enterprise Name
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
              value={form.enterprise}
              onChange={(e) =>
                setForm((f) => ({ ...f, enterprise: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1 text-sm">
            Organisation
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
              value={form.orgId || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, orgId: e.target.value }))
              }
            >
              <option value="">Select organisation</option>
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-md border p-3 space-y-3 dark:border-gray-800">
            <p className="text-sm font-medium">Hotel Admin User</p>
            <label className="block space-y-1 text-sm">
              Admin Name
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                placeholder="e.g. Friday Inn Admin"
                value={form.admin_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, admin_name: e.target.value }))
                }
              />
            </label>
            <label className="block space-y-1 text-sm">
              Admin Email (login)
              <input
                type="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                placeholder="admin@hotel.com"
                value={form.admin_email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, admin_email: e.target.value }))
                }
              />
            </label>
            <label className="block space-y-1 text-sm">
              Admin Password
              <input
                type="password"
                className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                placeholder="Min. 6 characters"
                value={form.admin_password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, admin_password: e.target.value }))
                }
              />
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            Start Date
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
              value={form.start_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, start_date: e.target.value }))
              }
            />
          </label>
          <label className="block space-y-1 text-sm">
            Expiry Date
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
              value={form.expiry_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, expiry_date: e.target.value }))
              }
            />
          </label>
        </div>
      </Modal>

      {/* Set Expiry modal */}
      <Modal
        open={Boolean(expiryTarget)}
        title="Set Expiry Date"
        confirmLabel="Save"
        onClose={() => setExpiryTarget(null)}
        onConfirm={saveExpiry}
      >
        <p className="mb-4 text-sm text-gray-500">
          Setting expiry for <strong>{expiryTarget?.enterprise}</strong> (ID{" "}
          <strong>{expiryTarget?.id}</strong>)
        </p>
        <input
          type="date"
          className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
      </Modal>

      {/* Delete modal */}
      <Modal
        open={Boolean(deleting)}
        title="Delete Enterprise"
        danger
        confirmLabel="Delete"
        onClose={() => setDeleting(null)}
        onConfirm={remove}
      >
        <p className="text-sm">
          Delete enterprise <strong>{deleting?.enterprise}</strong>?
        </p>
      </Modal>

      <Modal
        open={Boolean(usersTarget)}
        title={`Users — ${usersTarget?.enterprise || ""}`}
        onClose={() => setUsersTarget(null)}
        hideFooter
        closeOnBackdrop={false}
      >
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-md border dark:border-gray-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b dark:border-gray-800">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enterpriseUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-center text-gray-400"
                    >
                      No users assigned yet
                    </td>
                  </tr>
                )}
                {enterpriseUsers.map((row) => (
                  <tr key={row.id} className="border-b dark:border-gray-800">
                    <td className="px-3 py-2">{row.name || "—"}</td>
                    <td className="px-3 py-2">{row.email}</td>
                    <td className="px-3 py-2">
                      <Badge>
                        {row.role === "ENTERPRISE_ADMIN" ? "Admin" : "Staff"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      {row.role !== "ENTERPRISE_ADMIN" && (
                        <Button
                          variant="danger"
                          onClick={() => setRemovingUser(row)}
                        >
                          <span className="text-xs font-medium">Remove</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 border-t pt-4 dark:border-gray-800">
            <p className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Add Staff User
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block space-y-1 text-sm">
                Staff Name
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                  value={userForm.name}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </label>
              <label className="block space-y-1 text-sm">
                Staff Email (login)
                <input
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </label>
              <label className="block space-y-1 text-sm md:col-span-2">
                Password
                <input
                  type="password"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
                  placeholder="Min. 6 characters"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setUsersTarget(null)}>
                Close
              </Button>
              <Button onClick={addEnterpriseUser}>Add Staff</Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(removingUser)}
        title="Remove User"
        danger
        confirmLabel="Remove"
        onClose={() => setRemovingUser(null)}
        onConfirm={removeEnterpriseUserRow}
      >
        <p className="text-sm">
          Remove <strong>{removingUser?.email}</strong> from this enterprise?
        </p>
      </Modal>
    </div>
  );
}
