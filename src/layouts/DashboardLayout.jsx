import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuthStore } from '../store/auth.store.js';
import { useUiStore } from '../store/ui.store.js';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const breadcrumb = location.pathname.split('/').filter(Boolean).join(' / ') || 'dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f7f7f4] dark:bg-gray-950">
      <Sidebar />
      <div className={`${sidebarOpen ? 'md:pl-64' : 'md:pl-20'} transition-all`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
          <div className="flex items-center gap-3">
            <button aria-label="Toggle sidebar" className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium capitalize text-gray-600 dark:text-gray-300">{breadcrumb}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <span className="hidden text-sm text-gray-600 dark:text-gray-300 sm:inline">{user?.email}</span>
            <Button variant="secondary" onClick={handleLogout}><LogOut className="h-4 w-4" /> Logout</Button>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
