import { useState } from 'react';
import type { CouncilMember } from '../../../shared/types';

interface DirectMessageModalProps {
  member: CouncilMember;
  onClose: () => void;
  onSend: (type: string, content: string, targetMemberId: string) => void;
}

const ACTIONS = [
  { type: 'question', label: 'שאל שאלה', icon: '🎯', placeholder: 'מה תרצה לשאול?' },
  { type: 'challenge', label: 'אתגר', icon: '⚔️', placeholder: 'למה אתה חושב שזה לא נכון?' },
  { type: 'info', label: 'תן מידע', icon: '💡', placeholder: 'מידע שרלוונטי לתחום שלו...' },
  { type: 'elaborate', label: 'בקש הרחבה', icon: '🔍', placeholder: 'על מה תרצה שירחיב?' },
];

export default function DirectMessageModal({ member, onClose, onSend }: DirectMessageModalProps) {
  const [selectedAction, setSelectedAction] = useState(ACTIONS[0]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    await onSend(selectedAction.type, message, member.id);
    setSending(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl animate-bubble-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with character info */}
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
              style={{ background: member.color }}
            >
              {member.role.substring(0, 2)}
            </div>
            <div className="flex-1">
              <div className="text-white font-bold">{member.name}</div>
              <div className="text-sm" style={{ color: member.color }}>{member.role} — {member.domainTitle}</div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800"
            >
              ✕
            </button>
          </div>
          {member.nickname && (
            <div className="text-gray-500 text-xs mt-1 italic">"{member.nickname}" — {member.yearsExperience}+ שנות ניסיון</div>
          )}
        </div>

        {/* Action selector */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-2">
            {ACTIONS.map((action) => (
              <button
                key={action.type}
                onClick={() => setSelectedAction(action)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-all ${
                  selectedAction.type === action.type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-200'
                }`}
              >
                <span className="text-base">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message input */}
        <div className="p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            autoFocus
            placeholder={selectedAction.placeholder}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 resize-none focus:outline-none focus:border-indigo-500 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selectedAction.type === 'question' && (
              <>
                <Chip onClick={(t) => setMessage(t)} text="מה הסיכון הכי גדול כאן?" />
                <Chip onClick={(t) => setMessage(t)} text="איך אתה רואה את ה-ROI?" />
                <Chip onClick={(t) => setMessage(t)} text="ראית משהו דומה בקריירה שלך?" />
              </>
            )}
            {selectedAction.type === 'challenge' && (
              <>
                <Chip onClick={(t) => setMessage(t)} text="אני לא מסכים עם מה שאמרת. למה?" />
                <Chip onClick={(t) => setMessage(t)} text="תוכיח לי שזה יעבוד" />
                <Chip onClick={(t) => setMessage(t)} text="תתן דוגמה אמיתית" />
              </>
            )}
            {selectedAction.type === 'elaborate' && (
              <>
                <Chip onClick={(t) => setMessage(t)} text="תרחיב על הנקודה האחרונה" />
                <Chip onClick={(t) => setMessage(t)} text="מה בדיוק אתה מציע?" />
                <Chip onClick={(t) => setMessage(t)} text="תפרט את המספרים" />
              </>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                שולח...
              </>
            ) : (
              <>
                {selectedAction.icon} שלח ל{member.role}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Chip({ text, onClick }: { text: string; onClick: (text: string) => void }) {
  return (
    <button
      onClick={() => onClick(text)}
      className="text-[11px] bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded-lg px-2.5 py-1 transition-colors border border-gray-700/50"
    >
      {text}
    </button>
  );
}
