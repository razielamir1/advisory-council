import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface InteractionBarProps {
  discussionId: string;
  status: string;
  hasApiKey: boolean;
}

const QUICK_ACTIONS = [
  { icon: '🎯', label: 'שאל שאלה', type: 'question' },
  { icon: '💣', label: 'הזרק מידע', type: 'info' },
  { icon: '⚔️', label: 'אתגר עמדה', type: 'challenge' },
  { icon: '🔬', label: 'תחקרו', type: 'research' },
  { icon: '👤', label: 'הזמן מומחה', type: 'invite-guest' },
  { icon: '✅', label: 'סכמו', type: 'summarize' },
];

export default function InteractionBar({ discussionId, status }: InteractionBarProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [activeType, setActiveType] = useState<string>('question');

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const storedKey = localStorage.getItem('advisory-council-api-key');
      if (storedKey) headers['x-api-key'] = storedKey;
      await fetch(`/api/discussion/${discussionId}/interact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: activeType, content: input }),
      });
      setInput('');
    } catch { /* */ } finally {
      setSending(false);
    }
  }

  if (status === 'complete') {
    return (
      <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur p-4">
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(`/summary/${discussionId}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            צפה בסיכום
          </button>
          <button
            onClick={() => navigate(`/plan/${discussionId}`)}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            בנה תוכנית
          </button>
        </div>
      </div>
    );
  }

  if (status !== 'discussing' && status !== 'interactive') return null;

  return (
    <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur p-3">
      <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.type}
            onClick={() => setActiveType(action.type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
              activeType === action.type
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            <span>{action.icon}</span>
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            activeType === 'question' ? 'שאל שאלה למומחה ספציפי...' :
            activeType === 'info' ? 'הזרק מידע חדש לדיון...' :
            activeType === 'challenge' ? 'אתגר עמדה ספציפית...' :
            activeType === 'research' ? 'מה לחקור?' :
            activeType === 'invite-guest' ? 'איזה מומחה להזמין?' :
            'הקלד הודעה...'
          }
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          {sending ? '...' : 'שלח'}
        </button>
      </div>
    </div>
  );
}
