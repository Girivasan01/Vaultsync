import { Database } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-4 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Database className="h-7 w-7 text-ocean" />
          <span className="text-2xl font-bold">VaultSync</span>
        </div>
        {children}
      </div>
    </main>
  );
}
