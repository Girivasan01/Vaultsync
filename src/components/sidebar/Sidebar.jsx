import {
  Activity,
  Building2,
  Database,
  FileArchive,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { listEnterprises } from '../../api/enterprises.api.js';
import { usePermissions } from '../../hooks/usePermissions.js';
import { useUiStore } from '../../store/ui.store.js';
import { useOrgStore } from '../../store/org.store.js';
import { useOrgs } from '../../hooks/useOrgs.js';

function NavItem({ to, icon: Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition
        ${isActive ? 'bg-ocean text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'}
        ${collapsed ? 'justify-center px-2' : ''}`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function Sidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const {
    activeOrgId,
    activeOrgName,
    activeEnterpriseId,
    activeEnterpriseName,
    setActiveOrg,
    setActiveEnterprise,
    clearOrg,
  } = useOrgStore();
  const { isPlatformAdmin, isEnterpriseAdmin, enterprises: userEnterprises } = usePermissions();
  const { orgs: platformOrgs } = useOrgs();
  const orgs = isPlatformAdmin
    ? platformOrgs
    : Array.from(
        new Map(
          (userEnterprises || []).map((ent) => [ent.orgId, { id: ent.orgId, name: ent.orgName }]),
        ).values(),
      );
  const [orgDropOpen, setOrgDropOpen] = useState(false);
  const [entDropOpen, setEntDropOpen] = useState(false);
  const [enterprises, setEnterprises] = useState([]);

  const collapsed = !sidebarOpen;

  useEffect(() => {
    if (activeOrgId) {
      listEnterprises(activeOrgId)
        .then(setEnterprises)
        .catch(() => setEnterprises([]));
    } else {
      setEnterprises([]);
      setEntDropOpen(false);
    }
  }, [activeOrgId]);

  const handleSelectOrg = (org) => {
    setActiveOrg({ id: org.id, name: org.name });
    setOrgDropOpen(false);
    setEntDropOpen(false);
  };

  const handleSelectDefault = () => {
    clearOrg();
    setOrgDropOpen(false);
    setEntDropOpen(false);
  };

  const handleSelectEnterprise = (ent) => {
    setActiveEnterprise({ id: ent.id, name: ent.enterprise });
    setEntDropOpen(false);
  };

  const handleClearEnterprise = () => {
    setActiveEnterprise({ id: null, name: null });
    setEntDropOpen(false);
  };

  return (
    <aside
      className={`
      fixed inset-y-0 left-0 z-30 flex flex-col
      border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950
      transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden
      ${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'}
    `}
    >
      {/* Header */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-gray-100 dark:border-gray-800 px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}
      >
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-ocean shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold whitespace-nowrap">VaultSync</span>
          )}
        </div>
        {!collapsed && (
          <button
            className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Organisation picker */}
      {!collapsed && (
        <div className="relative mx-3 mt-3 mb-1 shrink-0">
          <button
            onClick={() => { setOrgDropOpen((o) => !o); setEntDropOpen(false); }}
            className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <span className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate">{activeOrgName || 'Select Organisation'}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
          </button>
          {orgDropOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
              {isPlatformAdmin && (
                <button
                  onClick={handleSelectDefault}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${!activeOrgId ? 'font-medium text-ocean' : 'text-gray-500'}`}
                >
                  All Organisations (Default)
                </button>
              )}
              {orgs.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-400">No organisations found</p>
              )}
              {orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleSelectOrg(org)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${activeOrgId === org.id ? 'font-medium text-ocean' : ''}`}
                >
                  {org.name}
                </button>
              ))}
              {isPlatformAdmin && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-2 py-1">
                  <NavItem to="/admin/orgs" icon={Building2} label="Manage Orgs" collapsed={false} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Enterprise picker — only shown when an org is selected */}
      {!collapsed && activeOrgId && (
        <div className="relative mx-3 mb-2 shrink-0">
          <button
            onClick={() => { setEntDropOpen((o) => !o); setOrgDropOpen(false); }}
            className="flex w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <span className="flex items-center gap-2 truncate">
              <ShieldCheck className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="truncate text-gray-600 dark:text-gray-300">
                {activeEnterpriseName || 'All Enterprises'}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
          </button>
          {entDropOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
              {(isPlatformAdmin || userEnterprises.length > 1) && (
                <button
                  onClick={handleClearEnterprise}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${!activeEnterpriseId ? 'font-medium text-ocean' : 'text-gray-500'}`}
                >
                  All Enterprises
                </button>
              )}
              {enterprises.length === 0 && (
                <p className="px-3 py-2 text-xs text-gray-400">No enterprises for this org</p>
              )}
              {enterprises.map((ent) => (
                <button
                  key={ent.id}
                  onClick={() => handleSelectEnterprise(ent)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${activeEnterpriseId === ent.id ? 'font-medium text-ocean' : ''}`}
                >
                  <span className="truncate">{ent.enterprise}</span>
                  {!ent.isActive && (
                    <span className="ml-auto text-xs text-gray-400">Inactive</span>
                  )}
                </button>
              ))}
              {(isPlatformAdmin || isEnterpriseAdmin) && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-2 py-1">
                  <NavItem to="/admin/enterprises" icon={ShieldCheck} label="Manage Enterprises" collapsed={false} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Collapsed org icon */}
      {collapsed && (
        <div className="flex flex-col items-center mt-3 mb-2 gap-1">
          <button
            title="Select Organisation"
            className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Building2 className="h-4 w-4 text-gray-400" />
          </button>
          {activeOrgId && (
            <button
              title={activeEnterpriseName || 'Select Enterprise'}
              className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ShieldCheck className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      )}

      {/* Main nav */}
      <nav className="space-y-1 px-2 py-2">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/applications" icon={Database} label="Applications" collapsed={collapsed} />
        <NavItem to="/backups" icon={FileArchive} label="Backups" collapsed={collapsed} />
        <NavItem to="/logs" icon={ListChecks} label="Logs" collapsed={collapsed} />
        <NavItem to="/analytics" icon={Activity} label="Analytics" collapsed={collapsed} />
      </nav>

      {(isPlatformAdmin || isEnterpriseAdmin) && (
        <div
          className={`px-2 pb-4 shrink-0 pt-2 mt-1 ${!collapsed ? 'border-t border-gray-200/30 dark:border-gray-700/50' : ''}`}
        >
          {collapsed && (
            <div className="border-t border-gray-100 dark:border-gray-700 mb-2 mx-1" />
          )}
          {!collapsed && (
            <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Admin
            </p>
          )}
          <nav className="space-y-1">
            {isPlatformAdmin && (
              <NavItem to="/admin/orgs" icon={Building2} label="Organisations" collapsed={collapsed} />
            )}
            <NavItem to="/admin/enterprises" icon={ShieldCheck} label="Enterprises" collapsed={collapsed} />
          </nav>
        </div>
      )}
    </aside>
  );
}