import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authedFetch } from '../../lib/authedFetch';
import Overview from './Overview';
import DiscussionsTable from './DiscussionsTable';
import UsersTable from './UsersTable';
import CostsChart from './CostsChart';

type Tab = 'overview' | 'discussions' | 'users' | 'costs';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'סקירה' },
  { id: 'discussions', label: 'דיונים' },
  { id: 'users', label: 'משתמשים' },
  { id: 'costs', label: 'עלויות' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await authedFetch('/api/admin/overview');
      if (cancelled) return;
      if (res.status === 404 || res.status === 401) {
        navigate('/', { replace: true });
        return;
      }
      setAuthorized(res.ok);
      setAuthChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-950 text-slate-300 flex items-center justify-center">
        טוען...
      </div>
    );
  }
  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">דאשבורד מנהל</h1>
            <p className="text-slate-500 text-sm mt-1">מבט על הפעילות במערכת</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-white text-sm transition-colors"
          >
            חזרה לאפליקציה
          </button>
        </div>

        <div className="flex gap-1 border-b border-slate-800 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <Overview />}
        {tab === 'discussions' && <DiscussionsTable />}
        {tab === 'users' && <UsersTable />}
        {tab === 'costs' && <CostsChart />}
      </div>
    </div>
  );
}
