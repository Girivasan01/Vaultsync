import { X } from 'lucide-react';
import { useState } from 'react';

export default function OrgSelectWarning({ message }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
      <span>{message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="shrink-0 rounded-md p-1 hover:bg-amber-100 dark:hover:bg-amber-900"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
