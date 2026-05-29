import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function StorageBarChart({ data }) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="appName" width={120} />
          <Tooltip />
          <Bar dataKey="limitGb" fill="#94a3b8" name="Limit GB" radius={[0, 4, 4, 0]} />
          <Bar dataKey="usedGb" fill="#0f766e" name="Used GB" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
