import clsx from 'clsx';

const styles = {
  SUCCESS: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  ERROR: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
  FAILED: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
  WARN: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  INFO: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
  DELETED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
  SCHEDULER: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
  MANUAL: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-100'
};

export default function Badge({ children, tone, className }) {
  return <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', styles[tone || children] || styles.INFO, className)}>{children}</span>;
}
