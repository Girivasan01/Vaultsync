export default function Tooltip({ content, children, position = 'top' }) {
  const positionClass =
    position === 'bottom'
      ? 'top-full mt-1.5'
      : 'bottom-full mb-1.5';

  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 ${positionClass} -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-950 px-2 py-0.5 text-center text-[11px] font-medium text-white opacity-0 shadow-md ring-1 ring-white/10 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-white dark:text-gray-900 dark:ring-gray-200/20`}
      >
        {content}
      </span>
    </span>
  );
}