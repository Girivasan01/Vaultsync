import clsx from 'clsx';

const variants = {
  primary: 'bg-ocean text-white hover:bg-teal-800',
  secondary: 'bg-white text-ink border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700',
  danger: 'bg-coral text-white hover:bg-rose-800',
  ghost: 'text-ink hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
};

export default function Button({ children, className, variant = 'primary', loading = false, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}
