import { useState, useEffect, useCallback } from 'react';

interface A11ySettings {
  fontSize: number;
  highContrast: boolean;
  grayscale: boolean;
  readableFont: boolean;
  stopAnimations: boolean;
  bigCursor: boolean;
  linkHighlight: boolean;
}

const DEFAULT: A11ySettings = {
  fontSize: 100,
  highContrast: false,
  grayscale: false,
  readableFont: false,
  stopAnimations: false,
  bigCursor: false,
  linkHighlight: false,
};

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(() => {
    try {
      const saved = localStorage.getItem('ac-a11y');
      return saved ? { ...DEFAULT, ...JSON.parse(saved) } : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  const apply = useCallback((s: A11ySettings) => {
    const root = document.documentElement;
    root.style.fontSize = `${s.fontSize}%`;
    root.classList.toggle('a11y-high-contrast', s.highContrast);
    root.classList.toggle('a11y-grayscale', s.grayscale);
    root.classList.toggle('a11y-readable-font', s.readableFont);
    root.classList.toggle('a11y-no-animations', s.stopAnimations);
    root.classList.toggle('a11y-big-cursor', s.bigCursor);
    root.classList.toggle('a11y-link-highlight', s.linkHighlight);
    localStorage.setItem('ac-a11y', JSON.stringify(s));
  }, []);

  useEffect(() => { apply(settings); }, [settings, apply]);

  function update(key: keyof A11ySettings, value: boolean | number) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    setSettings(DEFAULT);
  }

  const toggles: { key: keyof A11ySettings; label: string; icon: string }[] = [
    { key: 'highContrast', label: 'ניגודיות גבוהה', icon: '🔲' },
    { key: 'grayscale', label: 'גווני אפור', icon: '⬛' },
    { key: 'readableFont', label: 'גופן קריא', icon: 'Aa' },
    { key: 'stopAnimations', label: 'עצור אנימציות', icon: '⏸' },
    { key: 'bigCursor', label: 'סמן גדול', icon: '🖱️' },
    { key: 'linkHighlight', label: 'הדגש קישורים', icon: '🔗' },
  ];

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center text-xl transition-transform hover:scale-110"
        aria-label="Accessibility menu"
        title="תפריט נגישות"
      >
        ♿
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 left-6 z-50 w-72 bg-gray-900 dark:bg-gray-900 bg-white border border-gray-700 dark:border-gray-700 border-gray-200 rounded-2xl shadow-2xl p-5 animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white dark:text-white text-gray-900 font-bold text-sm">תפריט נגישות</h3>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-sm">✕</button>
          </div>

          {/* Font size */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">גודל טקסט: {settings.fontSize}%</div>
            <div className="flex gap-2">
              <button
                onClick={() => update('fontSize', Math.max(80, settings.fontSize - 10))}
                className="flex-1 py-1.5 rounded-lg bg-gray-800 dark:bg-gray-800 bg-gray-100 text-gray-300 dark:text-gray-300 text-gray-700 hover:bg-gray-700 text-sm font-bold"
              >
                A-
              </button>
              <button
                onClick={() => update('fontSize', 100)}
                className="flex-1 py-1.5 rounded-lg bg-gray-800 dark:bg-gray-800 bg-gray-100 text-gray-300 dark:text-gray-300 text-gray-700 hover:bg-gray-700 text-xs"
              >
                Reset
              </button>
              <button
                onClick={() => update('fontSize', Math.min(150, settings.fontSize + 10))}
                className="flex-1 py-1.5 rounded-lg bg-gray-800 dark:bg-gray-800 bg-gray-100 text-gray-300 dark:text-gray-300 text-gray-700 hover:bg-gray-700 text-sm font-bold"
              >
                A+
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            {toggles.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => update(key, !settings[key])}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-right ${
                  settings[key]
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-gray-800 dark:bg-gray-800 bg-gray-100 text-gray-400 dark:text-gray-400 text-gray-600 hover:bg-gray-700 dark:hover:bg-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-base w-6 text-center">{icon}</span>
                <span className="flex-1">{label}</span>
                {settings[key] && <span className="text-xs">✓</span>}
              </button>
            ))}
          </div>

          {/* Reset */}
          <button
            onClick={reset}
            className="w-full mt-4 py-2 rounded-lg bg-gray-800 dark:bg-gray-800 bg-gray-100 text-gray-400 dark:text-gray-400 text-gray-600 hover:text-white text-xs transition-colors"
          >
            איפוס הגדרות נגישות
          </button>
        </div>
      )}
    </>
  );
}
