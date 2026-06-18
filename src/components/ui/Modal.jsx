import { X } from 'lucide-react';
import { useEffect } from 'react';
import Button from './Button.jsx';

export default function Modal({ open, title, children, confirmLabel = 'Confirm', onConfirm, onClose, danger = false, hideFooter = false, closeOnBackdrop = true }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={(e) => { if (closeOnBackdrop && e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-gray-900 my-8 mx-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-lg bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button aria-label="Close" className="rounded-md p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto max-h-[60vh]">
          {children}
        </div>
        {!hideFooter && (
          <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-5 py-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
