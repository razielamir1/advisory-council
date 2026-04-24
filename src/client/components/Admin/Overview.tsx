import { useEffect, useState } from 'react';
import { authedFetch } from '../../lib/authedFetch';

type Metrics = {
  dau: number;
  wau: number;
  mau: number;
  total_discussions: number;
  completed_discussions: number;
  total_users: number;
  paid_users: number;
  today_cost_usd: number;
  month_cost_usd: number;
};

function Kpi({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="text-slate-500 text-xs mb-2">{label}</div>
      <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
      {sub && <div className="text-slate-400 text-xs mt-2">{sub}</div>}
    </div>
  );
}

export default function Overview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await authedFetch('/api/admin/overview');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
      }
    })();
  }, []);

  if (error) {
    return <div className="text-red-400 text-sm">{error}</div>;
  }
  if (!metrics) {
    return <div className="text-slate-500 text-sm">טוען נתונים...</div>;
  }

  const completionRate =
    metrics.total_discussions > 0
      ? Math.round((metrics.completed_discussions / metrics.total_discussions) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm text-slate-400 mb-3">משתמשים פעילים</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Kpi label="DAU - יום" value={metrics.dau} sub="משתמשים שפתחו דיון ב-24 שעות" />
          <Kpi label="WAU - שבוע" value={metrics.wau} sub="7 ימים אחרונים" />
          <Kpi label="MAU - חודש" value={metrics.mau} sub="30 יום אחרונים" />
        </div>
      </section>

      <section>
        <h2 className="text-sm text-slate-400 mb-3">דיונים</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Kpi label="סה״כ דיונים" value={metrics.total_discussions} />
          <Kpi label="הושלמו" value={metrics.completed_discussions} />
          <Kpi label="שיעור השלמה" value={`${completionRate}%`} />
        </div>
      </section>

      <section>
        <h2 className="text-sm text-slate-400 mb-3">משתמשים וחיובים</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Kpi label="סה״כ משתמשים" value={metrics.total_users} />
          <Kpi label="משלמים" value={metrics.paid_users} />
          <Kpi
            label="אחוז המרה"
            value={
              metrics.total_users > 0
                ? `${Math.round((metrics.paid_users / metrics.total_users) * 100)}%`
                : '0%'
            }
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm text-slate-400 mb-3">עלויות Gemini</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Kpi label="עלות היום" value={`$${metrics.today_cost_usd.toFixed(3)}`} />
          <Kpi label="עלות חודש" value={`$${metrics.month_cost_usd.toFixed(2)}`} />
        </div>
      </section>
    </div>
  );
}
