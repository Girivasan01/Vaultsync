import clsx from 'clsx';

const positionStyles = {
  top: {
    tooltip: 'bottom-full mb-2 -translate-x-1/2 left-1/2',
    arrow: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-white',
  },
  bottom: {
    tooltip: 'top-full mt-2 -translate-x-1/2 left-1/2',
    arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-white',
  },
};

export default function Tooltip({
  content,
  children,
  position = 'top',
  className,
}) {
  const styles = positionStyles[position] || positionStyles.top;

  return (
    <span className={clsx('group relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={clsx(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-center text-[11px] font-medium leading-tight text-white opacity-0 shadow-lg ring-1 ring-black/10 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-0.5 dark:bg-white dark:text-gray-900 dark:ring-gray-200/30',
          styles.tooltip,
        )}
      >
        {content}
        <span
          className={clsx(
            'absolute h-0 w-0 border-4 border-transparent',
            styles.arrow,
          )}
          aria-hidden
        />
      </span>
    </span>
  );
}
