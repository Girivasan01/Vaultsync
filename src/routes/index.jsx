import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ApplicationsPage from '../pages/ApplicationsPage.jsx';
import ApplicationDetailPage from '../pages/ApplicationDetailPage.jsx';
import BackupsPage from '../pages/BackupsPage.jsx';
import LogsPage from '../pages/LogsPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/applications', element: <ApplicationsPage /> },
          { path: '/applications/:id', element: <ApplicationDetailPage /> },
          { path: '/backups', element: <BackupsPage /> },
          { path: '/logs', element: <LogsPage /> }
        ]
      }
    ]
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> }
]);

export default router;
