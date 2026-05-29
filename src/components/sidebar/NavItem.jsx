import clsx from 'clsx';
import { NavLink } from 'react-router-dom';

export default function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => clsx(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
        isActive ? 'bg-ocean text-white' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
}
