import { useEffect, useState } from 'react';
import { authedFetch } from '../../lib/authedFetch';

type Row = {
  id: string;
  user_id: string;
  user_email: string;
  domain: string;
  mode: string;
  language: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  total_messages: number;
  total_tokens: number;
  estimated_cost_usd: string;
};

const STATUS_COLORS: Record<string, string> = {
  complete: 'text-green-400',
  active: 'text-amber-400',
  abandoned: 'text-slate-500',
  error: 'text-red-400',
};

export default function DiscussionsTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Record<string, string>>({});
  const [decrypting, setDecrypting] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await authedFetch('/api/admin/discussions');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRows(data.discussions || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function revealIdea(id: string) {
    if (ideas[id]) return;
    setDecrypting(id);
    try {
      const res = await authedFetch(`/api/admin/discussions/${id}/decrypt`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setIdeas((prev) => ({ ...prev, [id]: data.idea }));
    } catch (err) {
      console.error(err);
    } finally {
      setDecrypting(null);
    }
  }

  if (loading) return <div className="text-slate-500 text-sm">טוען...</div>;
  if (error) return <div className="text-red-400 text-sm">{error}</div>;

  const filtered = rows.filter((r) =>
    search
      ? r.user_email.toLowerCase().includes(search.toLowerCase()) ||
        r.domain.toLowerCase().includes(search.toLowerCase()) ||
        r.id.includes(search)
      : true,
  );

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <input
          placeholder="חיפוש לפי מייל, דומיין או ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        />
        <div className="text-slate-500 text-xs">{filtered.length} רשומות</div>
      </div>

      <div className="overflow-auto bg-slate-900 border border-slate-800 rounded-xl">
        <table className="w-full text-sm">
          <thead className="text-slate-400 text-xs uppercase border-b border-slate-800">
            <tr>
              <th className="text-right px-4 py-3">משתמש</th>
              <th className="text-right px-4 py-3">דומיין</th>
              <th className="text-right px-4 py-3">שפה</th>
              <th className="text-right px-4 py-3">סטטוס</th>
              <th className="text-right px-4 py-3">הודעות</th>
              <th className="text-right px-4 py-3">טוקנים</th>
              <th className="text-right px-4 py-3">עלות</th>
              <th className="text-right px-4 py-3">התחיל</th>
              <th className="text-right px-4 py-3">רעיון</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                <td className="px-4 py-3 text-slate-300">{r.user_email}</td>
                <td className="px-4 py-3 text-slate-400">{r.domain}</td>
                <td className="px-4 py-3 text-slate-400">{r.language}</td>
                <td className={`px-4 py-3 ${STATUS_COLORS[r.status] ?? 'text-slate-400'}`}>
                  {r.status}
                </td>
                <td className="px-4 py-3 text-slate-400 tabular-nums">{r.total_messages}</td>
                <td className="px-4 py-3 text-slate-400 tabular-nums">
                  {r.total_tokens.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-green-400 tabular-nums">
                  ${Number(r.estimated_cost_usd).toFixed(4)}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(r.started_at).toLocaleString('he-IL')}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  {ideas[r.id] ? (
                    <span className="text-slate-300 text-xs">{ideas[r.id].slice(0, 120)}...</span>
                  ) : (
                    <button
                      onClick={() => revealIdea(r.id)}
                      disabled={decrypting === r.id}
                      className="text-indigo-400 hover:text-indigo-300 text-xs disabled:opacity-50"
                    >
                      {decrypting === r.id ? 'מפענח...' : 'הצג רעיון'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
