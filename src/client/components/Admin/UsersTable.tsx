import { useEffect, useState } from 'react';
import { authedFetch } from '../../lib/authedFetch';

type Row = {
  id: string;
  email: string;
  created_at: string;
  last_seen_at: string | null;
  plan: string;
  monthly_usage_count: number;
  total_discussions: number;
  total_cost_usd: string;
};

export default function UsersTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await authedFetch('/api/admin/users');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRows(data.users || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-slate-500 text-sm">טוען...</div>;
  if (error) return <div className="text-red-400 text-sm">{error}</div>;

  return (
    <div className="overflow-auto bg-slate-900 border border-slate-800 rounded-xl">
      <table className="w-full text-sm">
        <thead className="text-slate-400 text-xs uppercase border-b border-slate-800">
          <tr>
            <th className="text-right px-4 py-3">מייל</th>
            <th className="text-right px-4 py-3">תוכנית</th>
            <th className="text-right px-4 py-3">שימוש חודשי</th>
            <th className="text-right px-4 py-3">סה״כ דיונים</th>
            <th className="text-right px-4 py-3">עלות שלי עליו</th>
            <th className="text-right px-4 py-3">הצטרף</th>
            <th className="text-right px-4 py-3">פעיל אחרון</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
              <td className="px-4 py-3 text-slate-300">{r.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    r.plan === 'paid'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {r.plan}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-400 tabular-nums">
                {r.monthly_usage_count}
              </td>
              <td className="px-4 py-3 text-slate-400 tabular-nums">{r.total_discussions}</td>
              <td className="px-4 py-3 text-green-400 tabular-nums">
                ${Number(r.total_cost_usd).toFixed(4)}
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs">
                {new Date(r.created_at).toLocaleDateString('he-IL')}
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs">
                {r.last_seen_at ? new Date(r.last_seen_at).toLocaleString('he-IL') : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
