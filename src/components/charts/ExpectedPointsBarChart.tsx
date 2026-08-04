import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ExpectedPointsBarChart({
  outName,
  outValue,
  inName,
  inValue,
}: {
  outName: string;
  outValue: number;
  inName: string;
  inValue: number;
}) {
  const data = [
    { name: outName, value: outValue, role: 'out' },
    { name: inName, value: inValue, role: 'in' },
  ];

  return (
    <div style={{ width: '100%', height: 120 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [`${Number(value).toFixed(1)} pts`, 'Projected (5 GWs)']}
            contentStyle={{ background: '#17171d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22}>
            {data.map((d) => (
              <Cell key={d.role} fill={d.role === 'in' ? '#34d399' : 'rgba(255,255,255,0.25)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
