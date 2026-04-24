import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { authedFetch } from '../../lib/authedFetch';

type DayRow = { day: string; cost_usd: string; calls: number };

export default function CostsChart() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await authedFetch(`/api/admin/costs?days=${days}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        setData(body.days || []);
      } catch (err: any) {
        setError(err.message || 'Failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        day: new Date(d.day).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }),
        cost: Number(d.cost_usd),
        calls: d.calls,
      })),
    [data],
  );

  const totalCost = useMemo(
    () => data.reduce((s, d) => s + Number(d.cost_usd), 0),
    [data],
  );
  const totalCalls = useMemo(() => data.reduce((s, d) => s + d.calls, 0), [data]);
  const avgPerCall = totalCalls > 0 ? totalCost / totalCalls : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[7, 30, 90].map((n) => (
            <button
              key={n}
              onClick={() => setDays(n)}
              className={`text-sm px-3 py-1.5 rounded transition-colors ${
                days === n
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {n} ימים
            </button>
          ))}
        </div>
        <div className="text-sm text-slate-500">
          סה״כ: <span className="text-green-400">${totalCost.toFixed(2)}</span> ·{' '}
          {totalCalls.toLocaleString()} קריאות · ממוצע ${avgPerCall.toFixed(4)} לקריאה
        </div>
      </div>

      {loading && <div className="text-slate-500 text-sm">טוען...</div>}
      {error && <div className="text-red-400 text-sm">{error}</div>}

      {!loading && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm text-slate-400 mb-4">עלות יומית (USD)</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(4)}`, 'עלות']}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#costGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
