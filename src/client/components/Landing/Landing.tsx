import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../shared/Button';
import ThemeToggle from '../shared/ThemeToggle';
import AccessibilityMenu from '../shared/AccessibilityMenu';
import { useHistory } from '../../hooks/useHistory';

const COUNCIL_MEMBERS = [
  { role: 'CEO', name: 'Nadav B.', color: '#1e40af' },
  { role: 'CTO', name: 'Matt G.', color: '#0891b2' },
  { role: 'CFO', name: 'Eli K.', color: '#059669' },
  { role: 'CPO', name: 'Gili H.', color: '#7c3aed' },
  { role: 'CMO', name: 'Noa L.', color: '#ea580c' },
  { role: 'COO', name: 'Daniel K.', color: '#6b7280' },
  { role: 'CDO', name: 'Or N.', color: '#0d9488' },
  { role: 'CAIO', name: 'Raziel A.', color: '#2563eb' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { history } = useHistory();
  const [showHow, setShowHow] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col relative">
      {/* Top bar */}
      <div className="absolute top-5 left-5 z-20">
        <ThemeToggle />
      </div>

      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-8">
        <div className="text-center max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-600 dark:text-indigo-400 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Advisory Council
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-4 leading-[1.1]">
            מועצת
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"> החכמים</span>
          </h1>

          <p className="text-lg text-gray-500 dark:text-gray-400 mb-3">
            Your Virtual Board of Directors
          </p>

          <p className="text-gray-500 dark:text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">
            הציגו רעיון, בעיה או עסק קיים — ומועצה של 8 מומחים בכירים תדון, תאתגר ותייעץ. דיון אמיתי, לא ריצוי.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center gap-3">
            <Button size="lg" onClick={() => navigate('/start')} className="text-lg px-10">
              כנס את המועצה
            </Button>
            <button
              onClick={() => setShowHow(true)}
              className="text-sm text-gray-400 dark:text-gray-500 hover:text-indigo-500 transition-colors"
            >
              איך זה עובד?
            </button>
          </div>
        </div>

        {/* Council members strip */}
        <div className="mt-14 flex items-center gap-5 flex-wrap justify-center max-w-2xl">
          {COUNCIL_MEMBERS.map((m, i) => (
            <div
              key={m.role}
              className="flex flex-col items-center gap-1.5 animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-lg"
                style={{ background: m.color, boxShadow: `0 4px 15px ${m.color}30` }}
              >
                {m.role.substring(0, 2)}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">{m.role}</div>
              <div className="text-[9px] text-gray-400 dark:text-gray-600">{m.name}</div>
            </div>
          ))}
        </div>

        {/* Features row */}
        <div className="mt-14 grid grid-cols-3 gap-8 max-w-xl w-full">
          {[
            { icon: '🎯', title: '8 מומחים', desc: '30+ שנות ניסיון כל אחד' },
            { icon: '⚔️', title: 'ספקנות', desc: 'חולקים ומאתגרים, לא מרצים' },
            { icon: '🚀', title: 'לביצוע', desc: 'תוכנית, צוות, תקציב' },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{f.title}</div>
              <div className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Discussions */}
      {history.length > 0 && (
        <div className="pb-12 px-4">
          <div className="max-w-xl mx-auto">
            <h3 className="text-gray-400 dark:text-gray-500 font-medium text-xs uppercase tracking-wider mb-3 text-center">דיונים אחרונים</h3>
            <div className="space-y-1.5">
              {history.slice(0, 3).map((record) => (
                <button
                  key={record.id}
                  onClick={() => navigate(`/office/${record.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800/50 border border-gray-200 dark:border-slate-800 transition-colors text-right"
                >
                  <span className="text-lg">{record.domainIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800 dark:text-gray-200 truncate">{record.idea}</div>
                    <div className="text-[10px] text-gray-400">{record.domain} · {record.date}</div>
                  </div>
                  <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How it works modal */}
      {showHow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowHow(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowHow(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 dark:hover:text-white">✕</button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5 text-center">איך זה עובד?</h2>
            <div className="space-y-4">
              {[
                { step: '1', icon: '📝', title: 'תאר את הרעיון', desc: 'רעיון חדש, עסק קיים (עם לינק לאתר), או בעיה חופשית' },
                { step: '2', icon: '🏢', title: 'בחר תחום ומצב', desc: 'הנהלה בכירה (CEO, CTO, CFO...) או מועצת חכמים (מומחים אמיתיים)' },
                { step: '3', icon: '💬', title: '8 מומחים דנים', desc: '7 שלבי דיון: פתיחה, חקירה, מחקר, עימות, מומחה אורח, הסכמה, סיכום' },
                { step: '4', icon: '🎯', title: 'אתה מנהל', desc: 'לחץ על דמות לשאול ישירות, הזרק מידע, אתגר עמדה, שנה מהירות' },
                { step: '5', icon: '📋', title: 'סיכום + תוכנית', desc: 'Action items עם הפניה לסוכנים, תקציב, צוות, ציר זמן — הכל' },
              ].map((s) => (
                <div key={s.step} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                      <span>{s.icon}</span> {s.title}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button onClick={() => { setShowHow(false); navigate('/start'); }}>
                בוא נתחיל
              </Button>
            </div>
          </div>
        </div>
      )}

      <AccessibilityMenu />
    </div>
  );
}
