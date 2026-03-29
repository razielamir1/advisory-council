import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../shared/Button';
import ThemeToggle from '../shared/ThemeToggle';
import AccessibilityMenu from '../shared/AccessibilityMenu';
import { useHistory } from '../../hooks/useHistory';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const COUNCIL = [
  { role: 'CEO', name: 'Nadav B.', color: '#1e40af', desc: 'אסטרטגיה, exits, scaling' },
  { role: 'CTO', name: 'Matt G.', color: '#0891b2', desc: 'טכנולוגיה, ארכיטקטורה' },
  { role: 'CFO', name: 'Eli K.', color: '#059669', desc: 'פיננסים, גיוסים, unit economics' },
  { role: 'CPO', name: 'Gili H.', color: '#7c3aed', desc: 'מוצר, UX, product-market fit' },
  { role: 'CMO', name: 'Noa L.', color: '#ea580c', desc: 'שיווק, GTM, מיתוג' },
  { role: 'COO', name: 'Daniel K.', color: '#6b7280', desc: 'תפעול, תהליכים, scaling' },
  { role: 'CDO', name: 'Or N.', color: '#0d9488', desc: 'דאטה, מחקר שוק, ניתוח' },
  { role: 'CAIO', name: 'Raziel A.', color: '#2563eb', desc: 'פתרונות AI, no-code, אוטומציה' },
];

const STEPS = [
  { num: '1', icon: '📝', title: 'תאר את האתגר', desc: 'רעיון חדש, עסק קיים (עם לינק), או בעיה חופשית' },
  { num: '2', icon: '🏢', title: 'בחר תחום ושפה', desc: '22 תחומים, 6 שפות, הנהלה בכירה או מועצת חכמים' },
  { num: '3', icon: '💬', title: 'המועצה דנה', desc: '7 שלבים: פתיחה, חקירה, מחקר, עימות, מומחה אורח, הסכמה, סיכום' },
  { num: '4', icon: '🎯', title: 'אתה מנהל', desc: 'לחץ על דמות, שאל, אתגר, הזרק מידע, שלוט במהירות' },
  { num: '5', icon: '🚀', title: 'מרעיון לביצוע', desc: 'סיכום, תוכנית פעולה, הפניה לסוכנים, LaunchPad' },
];

const TESTIMONIALS = [
  { text: 'הצגתי רעיון לאפליקציה לניהול תורים והמועצה הראתה לי 3 בעיות שלא חשבתי עליהן. חסכו לי חודשים.', role: 'יזם, תל אביב' },
  { text: 'ה-CAIO הציע לי לבנות MVP ב-Base44 בשבוע במקום 3 חודשי פיתוח. פשוט גאוני.', role: 'בעל עסק קטן' },
  { text: 'הדיון בין ה-CFO ל-CEO על ה-ROI היה עמוק יותר מדיון אמיתי שהיה לי עם יועצים.', role: 'מנכ"ל סטארטאפ' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { history } = useHistory();
  const revealRef = useScrollReveal(100);

  const totalDiscussions = history.length;
  const totalMessages = history.reduce((s, h) => s + h.messagesCount, 0);

  return (
    <div ref={revealRef} className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <div className="fixed top-5 left-5 z-30">
        <ThemeToggle />
      </div>

      {/* ===== HERO ===== */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-600 dark:text-indigo-400 text-sm mb-8" data-reveal="0">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Advisory Council
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-4 leading-[1.1]" data-reveal="1">
          מועצת
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"> החכמים</span>
        </h1>

        <p className="text-lg text-gray-500 dark:text-gray-400 mb-3" data-reveal="2">
          Your Virtual Board of Directors
        </p>

        <p className="text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed" data-reveal="3">
          הציגו רעיון, בעיה או עסק קיים — ו-8 מומחים בכירים ידונו, יאתגרו ויייעצו. דיון אמיתי, לא ריצוי.
        </p>

        <div data-reveal="4">
          <Button size="lg" onClick={() => navigate('/start')} className="text-lg px-10">
            כנס את המועצה
          </Button>
        </div>

        {/* Stats */}
        {totalDiscussions > 0 && (
          <div className="mt-10 flex gap-8 text-center" data-reveal="5">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalDiscussions}</div>
              <div className="text-xs text-gray-400">דיונים</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalMessages}</div>
              <div className="text-xs text-gray-400">הודעות</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
              <div className="text-xs text-gray-400">מומחים</div>
            </div>
          </div>
        )}

        {/* Scroll hint */}
        <div className="mt-16 text-gray-300 dark:text-gray-700 animate-bounce text-2xl">↓</div>
      </section>

      {/* ===== COUNCIL MEMBERS ===== */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3" data-reveal="0">המועצה</h2>
          <p className="text-gray-500 text-center mb-12" data-reveal="1">8 מנהלים בכירים עם 30+ שנות ניסיון כל אחד</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COUNCIL.map((m, i) => (
              <div
                key={m.role}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800"
                data-reveal={String(i + 2)}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-sm font-bold mb-3 shadow-lg"
                  style={{ background: m.color, boxShadow: `0 4px 20px ${m.color}25` }}
                >
                  {m.role}
                </div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{m.name}</div>
                <div className="text-[11px] text-gray-400 mt-1">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12" data-reveal="0">איך זה עובד?</h2>

          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <div
                key={s.num}
                className="flex gap-5 items-start"
                data-reveal={String(i + 1)}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg flex-shrink-0">
                  {s.num}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{s.icon}</span> {s.title}
                  </div>
                  <div className="text-gray-500 text-sm mt-1">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12" data-reveal="0">מה אומרים</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800"
                data-reveal={String(i + 1)}
              >
                <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">"{t.text}"</div>
                <div className="text-xs text-gray-400">— {t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '⚔️', title: 'ספקנות מקצועית', desc: 'לא מרצים ולא מחמיאים — מאתגרים, חוקרים, מקשים. Devil\'s advocate מובנה.' },
            { icon: '🌐', title: '3 מצבי קלט', desc: 'רעיון חדש, ניתוח אתר קיים (כתוב URL ומקבל ניתוח), או בעיה חופשית.' },
            { icon: '🤖', title: 'מומחה AI בשולחן', desc: 'Raziel (CAIO) מציע פתרונות Base44/Bolt/v0 לפני שמגייסים מפתחים.' },
          ].map((f, i) => (
            <div key={f.title} className="text-center p-6" data-reveal={String(i)}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="text-gray-900 dark:text-white font-semibold mb-2">{f.title}</div>
              <div className="text-gray-500 text-sm leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PAST DISCUSSIONS ===== */}
      {history.length > 0 && (
        <section className="py-16 px-4 bg-white dark:bg-gray-900/50">
          <div className="max-w-xl mx-auto">
            <h3 className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-3 text-center" data-reveal="0">דיונים אחרונים</h3>
            <div className="space-y-1.5">
              {history.slice(0, 3).map((record, i) => (
                <button
                  key={record.id}
                  onClick={() => navigate(`/office/${record.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800/50 border border-gray-200 dark:border-slate-800 transition-colors text-right"
                  data-reveal={String(i + 1)}
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
        </section>
      )}

      {/* ===== CTA BOTTOM ===== */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4" data-reveal="0">מוכן לכנס את המועצה?</h2>
        <p className="text-gray-500 mb-8" data-reveal="1">זה חינם, מקומי, ופרטי לחלוטין.</p>
        <div data-reveal="2">
          <Button size="lg" onClick={() => navigate('/start')} className="text-lg px-10">
            בוא נתחיל
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-400">Advisory Council · Powered by Gemini AI · Open Source</div>
      </footer>

      <AccessibilityMenu />
    </div>
  );
}
