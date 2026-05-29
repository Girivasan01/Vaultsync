import clsx from 'clsx';

export function Card({ children, className }) {
  return <div className={clsx('rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900', className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return <h2 className={clsx('text-base font-semibold text-gray-950 dark:text-white', className)}>{children}</h2>;
}
