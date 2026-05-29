export default function Skeleton({ className = 'h-5 w-full' }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className}`} />;
}
