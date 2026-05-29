import clsx from 'clsx';

export default function StatusDot({ active }) {
  return <span className={clsx('inline-block h-2.5 w-2.5 rounded-full', active ? 'bg-emerald-500' : 'bg-gray-400')} />;
}
