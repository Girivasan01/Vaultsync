const presets = [
  { label: 'Daily 2 AM', value: '0 2 * * *' },
  { label: 'Every 6 Hours', value: '0 */6 * * *' },
  { label: 'Weekdays 1 AM', value: '0 1 * * 1-5' }
];

function describeCron(value) {
  if (value === '0 2 * * *') return 'Runs daily at 02:00 (server local time)';
  if (value === '0 */6 * * *') return 'Runs every six hours';
  if (value === '0 1 * * 1-5') return 'Runs weekdays at 01:00 (server local time)';
  return 'Custom cron expression, evaluated in server local time';
}

export default function CronExpressionInput({ value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className={`rounded-md border px-3 py-2 text-sm ${value === preset.value ? 'border-ocean bg-teal-50 text-ocean dark:bg-teal-950' : 'border-gray-200 dark:border-gray-700'}`}
            onClick={() => onChange(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <input className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-950" value={value} onChange={(event) => onChange(event.target.value)} />
      <p className="text-xs text-gray-500">{describeCron(value)}</p>
    </div>
  );
}
