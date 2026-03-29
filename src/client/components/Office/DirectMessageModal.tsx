import { useState, useRef, useEffect } from 'react';
import type { CouncilMember, DiscussionMessage } from '../../../shared/types';

interface DirectMessageModalProps {
  member: CouncilMember;
  allMembers: CouncilMember[];
  messages: DiscussionMessage[];
  onClose: () => void;
  onSend: (type: string, content: string, targetMemberId: string) => void;
}

const ACTIONS = [
  { type: 'question', label: 'שאל', icon: '🎯', placeholder: 'מה תרצה לשאול?' },
  { type: 'challenge', label: 'אתגר', icon: '⚔️', placeholder: 'למה אתה חושב שזה לא נכון?' },
  { type: 'info', label: 'מידע', icon: '💡', placeholder: 'מידע שרלוונטי...' },
  { type: 'elaborate', label: 'הרחב', icon: '🔍', placeholder: 'על מה להרחיב?' },
];

export default function DirectMessageModal({ member, allMembers, messages, onClose, onSend }: DirectMessageModalProps) {
  const [selectedAction, setSelectedAction] = useState(ACTIONS[0]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Get conversation between user and this member
  const conversation = messages.filter(
    m => m.memberId === member.id || m.memberId === 'user'
  ).slice(-10);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [conversation.length]);

  async function handleSend(targetId?: string) {
    if (!message.trim()) return;
    setSending(true);
    await onSend(selectedAction.type, message, targetId || member.id);
    setMessage('');
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl animate-bubble-in flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-3 flex-shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: member.color }}
          >
            {member.role.substring(0, 2)}
          </div>
          <div className="flex-1">
            <div className="text-white font-bold text-sm">{member.name}</div>
            <div className="text-xs" style={{ color: member.color }}>{member.role}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800">✕</button>
        </div>

        {/* Conversation history */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[120px]">
          {conversation.length === 0 && (
            <div className="text-center text-gray-600 text-sm py-4">
              שאל את {member.name} שאלה ישירה
            </div>
          )}
          {conversation.map((msg) => {
            const isUser = msg.memberId === 'user';
            const speaker = isUser ? null : allMembers.find(m => m.id === msg.memberId);
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  isUser
                    ? 'bg-amber-500/15 text-amber-200 rounded-tr-sm'
                    : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                }`}>
                  {!isUser && (
                    <div className="text-[10px] font-medium mb-1" style={{ color: speaker?.color || member.color }}>
                      {speaker?.role || member.role}
                    </div>
                  )}
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            );
          })}
          {sending && (
            <div className="flex justify-end">
              <div className="bg-slate-800 rounded-2xl px-4 py-2.5 rounded-tl-sm">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {member.name} חושב...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="border-t border-gray-800 p-3 flex-shrink-0">
          {/* Action type selector */}
          <div className="flex gap-1 mb-2">
            {ACTIONS.map((a) => (
              <button
                key={a.type}
                onClick={() => setSelectedAction(a)}
                className={`flex-1 text-[10px] py-1 rounded-lg transition-all ${
                  selectedAction.type === a.type ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-500 hover:text-gray-300'
                }`}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>

          {/* Input + send buttons */}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={selectedAction.placeholder}
              disabled={sending}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!message.trim() || sending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              title={`שלח ל-${member.role}`}
            >
              {member.role} →
            </button>
            <button
              onClick={() => handleSend(allMembers[0]?.id)}
              disabled={!message.trim() || sending}
              className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              title="שלח לכל השולחן (CEO יגיב)"
            >
              🏢 כולם
            </button>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1 mt-2">
            <Chip onClick={(t) => setMessage(t)} text="תרחיב" />
            <Chip onClick={(t) => setMessage(t)} text="למה?" />
            <Chip onClick={(t) => setMessage(t)} text="מה האלטרנטיבה?" />
            <Chip onClick={(t) => setMessage(t)} text="תתן דוגמה" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ text, onClick }: { text: string; onClick: (t: string) => void }) {
  return (
    <button
      onClick={() => onClick(text)}
      className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-500 hover:text-gray-300 rounded-lg px-2 py-0.5 transition-colors"
    >
      {text}
    </button>
  );
}
