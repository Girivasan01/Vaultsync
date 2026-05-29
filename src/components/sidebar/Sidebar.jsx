import { Activity, Database, FileArchive, LayoutDashboard, ListChecks } from 'lucide-react';
import NavItem from './NavItem.jsx';
import { useUiStore } from '../../store/ui.store.js';

export default function Sidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-20'} fixed inset-y-0 left-0 z-30 overflow-hidden border-r border-gray-200 bg-white transition-all dark:border-gray-800 dark:bg-gray-950`}>
      <div className="flex h-16 items-center gap-2 px-5">
        <Database className="h-6 w-6 text-ocean" />
        {sidebarOpen ? <span className="text-lg font-bold">VaultSync</span> : null}
      </div>
      <nav className="space-y-1 px-3">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/applications" icon={Database} label="Applications" />
        <NavItem to="/backups" icon={FileArchive} label="Backups" />
        <NavItem to="/logs" icon={ListChecks} label="Logs" />
        <NavItem to="/dashboard" icon={Activity} label="Analytics" />
      </nav>
    </aside>
  );
}
