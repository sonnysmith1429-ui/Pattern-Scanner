import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Position } from '../../types';
import { POSITION_COLORS, POSITION_LABELS } from '../../lib/fpl/constants';

export default function SquadValueDonut({ spendByPosition }: { spendByPosition: Record<Position, number> }) {
  const data = (Object.entries(spendByPosition) as [Position, number][])
    .filter(([, v]) => v > 0)
    .map(([position, value]) => ({ position, value, label: POSITION_LABELS[position] }));

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <div style={{ width: 130, height: 130 }} className="shrink-0 relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={38} outerRadius={62} paddingAngle={3} stroke="none">
              {data.map((d) => (
                <Cell key={d.position} fill={POSITION_COLORS[d.position]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => [`£${Number(value).toFixed(1)}m`, item?.payload?.label ?? '']}
              contentStyle={{ background: '#17171d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-semibold tabular-nums">£{total.toFixed(1)}m</span>
          <span className="text-[10px] text-white/40">total value</span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1 min-w-0">
        {data.map((d) => (
          <div key={d.position} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-white/60">
              <span className="w-2 h-2 rounded-full" style={{ background: POSITION_COLORS[d.position] }} />
              {d.label}
            </span>
            <span className="tabular-nums text-white/80">£{d.value.toFixed(1)}m</span>
          </div>
        ))}
      </div>
    </div>
  );
}
