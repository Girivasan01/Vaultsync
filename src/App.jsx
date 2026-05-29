import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import router from './routes/index.jsx';
import { useUiStore } from './store/ui.store.js';

export default function App() {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, [theme]);

  return <RouterProvider router={router} />;
}
