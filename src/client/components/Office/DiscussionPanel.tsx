import { useRef, useEffect } from 'react';
import type { DiscussionMessage, CouncilMember, DiscussionPhase } from '../../../shared/types';
import { DISCUSSION_PHASES } from '../../../shared/types';

interface DiscussionPanelProps {
  messages: DiscussionMessage[];
  members: CouncilMember[];
  currentPhase: DiscussionPhase;
  status: string;
}

export default function DiscussionPanel({ messages, members, currentPhase, status }: DiscussionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getMember = (id: string) => members.find((m) => m.id === id);
  const phaseInfo = DISCUSSION_PHASES.find((p) => p.id === currentPhase);

  // Group messages by phase
  const groupedMessages: { phase: DiscussionPhase; msgs: DiscussionMessage[] }[] = [];
  let currentGroup: typeof groupedMessages[0] | null = null;

  for (const msg of messages) {
    if (!currentGroup || currentGroup.phase !== msg.phase) {
      currentGroup = { phase: msg.phase, msgs: [] };
      groupedMessages.push(currentGroup);
    }
    currentGroup.msgs.push(msg);
  }

  return (
    <div className="w-96 bg-gray-900/80 backdrop-blur border-r border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white font-bold text-sm">תמליל הדיון</h2>
        {phaseInfo && (
          <div className="text-xs text-gray-500 mt-1">
            {phaseInfo.labelHe} — {phaseInfo.description}
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {groupedMessages.map((group, gi) => {
          const pi = DISCUSSION_PHASES.find((p) => p.id === group.phase);
          return (
            <div key={gi}>
              {/* Phase header */}
              <div className="flex items-center gap-2 my-4 first:mt-0">
                <div className="h-px flex-1 bg-gray-800" />
                <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                  {pi?.labelHe || group.phase}
                </span>
                <div className="h-px flex-1 bg-gray-800" />
              </div>

              {group.msgs.map((msg) => {
                const member = getMember(msg.memberId);
                if (!member) return null;

                const isSideChat = msg.type === 'side-chat';
                const isModerator = msg.type === 'moderator';

                return (
                  <div
                    key={msg.id}
                    className={`animate-slide-in mb-3 ${isSideChat ? 'opacity-60 pl-4' : ''} ${isModerator ? 'text-center' : ''}`}
                  >
                    {isModerator ? (
                      <div className="text-xs text-indigo-400 italic py-2">{msg.content}</div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white font-bold"
                            style={{ background: member.color }}
                          >
                            {member.role.substring(0, 2)}
                          </div>
                          <span className="text-xs font-medium" style={{ color: member.color }}>
                            {member.role}
                          </span>
                          <span className="text-xs text-gray-600">{member.name}</span>
                          {isSideChat && <span className="text-[9px] text-gray-700">(שיחת צד)</span>}
                        </div>
                        <div className="text-sm text-gray-300 leading-relaxed pr-7 whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="text-center text-gray-600 mt-12">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-sm">הדיון טרם התחיל</div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="p-3 border-t border-gray-800 text-center">
        <span className="text-[10px] text-gray-600">
          {status === 'discussing' && '🔴 הדיון בעיצומו'}
          {status === 'interactive' && '🟢 מצב אינטראקטיבי — שאל שאלה'}
          {status === 'complete' && '✅ הדיון הסתיים'}
          {status === 'idle' && '⏳ ממתין...'}
        </span>
      </div>
    </div>
  );
}
