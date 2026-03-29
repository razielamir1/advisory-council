import { useNavigate } from 'react-router-dom';
import Button from '../shared/Button';
import ThemeToggle from '../shared/ThemeToggle';
import AccessibilityMenu from '../shared/AccessibilityMenu';
import { useHistory } from '../../hooks/useHistory';

const FLOATING_ROLES = [
  { role: 'CEO', color: '#1e40af', x: 15, y: 20 },
  { role: 'CTO', color: '#0891b2', x: 75, y: 15 },
  { role: 'CFO', color: '#059669', x: 85, y: 55 },
  { role: 'CMO', color: '#ea580c', x: 10, y: 60 },
  { role: 'COO', color: '#6b7280', x: 50, y: 75 },
  { role: 'CPO', color: '#7c3aed', x: 25, y: 80 },
  { role: 'CSO', color: '#9333ea', x: 70, y: 80 },
];

export default function Landing() {
  const navigate = useNavigate();
  const { history } = useHistory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-white dark:from-gray-950 dark:via-indigo-950/30 dark:to-gray-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Top bar */}
      <div className="absolute top-4 left-4 z-20">
        <ThemeToggle />
      </div>
      {/* Floating role badges */}
      {FLOATING_ROLES.map((r, i) => (
        <div
          key={r.role}
          className="absolute opacity-15 text-sm font-bold rounded-full px-3 py-1 border animate-breathe"
          style={{
            left: `${r.x}%`,
            top: `${r.y}%`,
            borderColor: r.color,
            color: r.color,
            animationDelay: `${i * 0.5}s`,
          }}
        >
          {r.role}
        </div>
      ))}

      {/* Hero */}
      <div className="text-center max-w-3xl z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-600 dark:text-indigo-400 text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          AI-Powered Advisory Council
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          מועצת
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"> החכמים</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-4">
          Your Virtual Board of Directors
        </p>

        <p className="text-gray-600 dark:text-gray-500 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
          הציגו רעיון, בחרו תחום — ומועצה של מומחים בכירים תדון, תאתגר, תחקור ותייעץ.
          <br />
          דיון אמיתי. ספקנות מקצועית. לא ריצוי.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/start')} className="text-lg">
            כנס את המועצה
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/start')} className="text-lg">
            איך זה עובד?
          </Button>
        </div>
      </div>

      {/* Mini office illustration — always dark boardroom */}
      <div className="mt-20 w-full max-w-2xl z-10">
        <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-8">
          {/* Table */}
          <div className="mx-auto w-48 h-24 bg-amber-900/40 rounded-[50%] border border-amber-700/50 flex items-center justify-center">
            <span className="text-slate-400 text-xs">שולחן ישיבות</span>
          </div>
          {/* Mini characters around table */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-6 h-6 rounded-full bg-blue-800 border-2 border-blue-400" title="CEO" />
          </div>
          <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-1">
            <div className="w-6 h-6 rounded-full bg-cyan-800 border-2 border-cyan-400" title="CTO" />
            <div className="w-6 h-6 rounded-full bg-green-800 border-2 border-green-400" title="CFO" />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-400" title="COO" />
            <div className="w-6 h-6 rounded-full bg-orange-800 border-2 border-orange-400" title="CMO" />
          </div>
          <div className="absolute top-1/2 left-6 -translate-y-1/2 flex flex-col gap-1">
            <div className="w-6 h-6 rounded-full bg-purple-800 border-2 border-purple-400" title="CPO" />
            <div className="w-6 h-6 rounded-full bg-pink-800 border-2 border-pink-400" title="CHRO" />
          </div>
          {/* Whiteboard */}
          <div className="absolute -right-2 top-2 w-16 h-12 bg-slate-800 border border-slate-600 rounded text-[8px] text-slate-400 flex items-center justify-center">
            Whiteboard
          </div>
          {/* Coffee corner */}
          <div className="absolute -left-2 bottom-2 text-sm">☕</div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full z-10 px-4">
        {[
          { icon: '🎯', title: 'מומחים מובילים', desc: 'מועצה של 3-5 מומחים עם 30+ שנות ניסיון' },
          { icon: '⚔️', title: 'ספקנות מקצועית', desc: 'חולקים, מאתגרים, מקשים — לא מרצים' },
          { icon: '🚀', title: 'מרעיון לביצוע', desc: 'תוכנית פעולה, צוות, תקציב — הכל' },
        ].map((f) => (
          <div key={f.title} className="text-center p-6">
            <div className="text-3xl mb-3">{f.icon}</div>
            <div className="text-gray-900 dark:text-white font-semibold mb-1">{f.title}</div>
            <div className="text-gray-500 text-sm">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Past Discussions */}
      {history.length > 0 && (
        <div className="mt-16 w-full max-w-3xl z-10 px-4">
          <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-4 text-center">דיונים קודמים</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((record) => (
              <button
                key={record.id}
                onClick={() => navigate(`/office/${record.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700/30 transition-colors text-right"
              >
                <span className="text-2xl">{record.domainIcon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{record.idea}</div>
                  <div className="text-xs text-gray-500">{record.domain} · {record.membersCount} מומחים · {record.date}</div>
                </div>
                <span className="text-xs text-gray-400">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <AccessibilityMenu />
    </div>
  );
}
