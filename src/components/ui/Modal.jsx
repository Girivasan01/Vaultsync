import { X } from 'lucide-react';
import Button from './Button.jsx';

export default function Modal({ open, title, children, confirmLabel = 'Confirm', onConfirm, onClose, danger = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button aria-label="Close" className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>{children}</div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
