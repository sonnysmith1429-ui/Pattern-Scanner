import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { PlayerGameweekHistory } from '../../types';

export default function FormTrendChart({ history }: { history: PlayerGameweekHistory[] }) {
  if (!history.length) {
    return <p className="text-xs text-white/35 text-center py-8">No gameweek history available yet.</p>;
  }
  const data = history.map((h) => ({ gw: `GW${h.gameweek}`, points: h.points }));

  return (
    <div style={{ width: '100%', height: 140 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="formGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="gw" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#17171d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
          />
          <Area type="monotone" dataKey="points" name="Points" stroke="#34d399" strokeWidth={2} fill="url(#formGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
