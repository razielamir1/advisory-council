import { useRef, useEffect } from 'react';
import type { DiscussionMessage, CouncilMember, DiscussionPhase } from '../../../shared/types';
import { DISCUSSION_PHASES } from '../../../shared/types';

interface DiscussionPanelProps {
  messages: DiscussionMessage[];
  members: CouncilMember[];
  currentPhase: DiscussionPhase;
  status: string;
  activeSpeakerId: string | null;
}

export default function DiscussionPanel({ messages, members, currentPhase, status, activeSpeakerId }: DiscussionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const getMember = (id: string) => members.find((m) => m.id === id);

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

  const phaseIdx = DISCUSSION_PHASES.findIndex(p => p.id === currentPhase);

  return (
    <div className="w-[480px] min-w-[380px] bg-slate-950 flex flex-col h-full border-r border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">הדיון</h2>
          <div className="text-slate-400 text-xs mt-0.5">
            {DISCUSSION_PHASES[phaseIdx]?.labelHe || 'ממתין'} — שלב {phaseIdx + 1}/{DISCUSSION_PHASES.length}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${status === 'discussing' ? 'bg-red-500 animate-pulse' : status === 'complete' ? 'bg-green-500' : 'bg-slate-500'}`} />
          <span className="text-slate-400 text-[11px]">
            {status === 'discussing' ? 'חי' : status === 'complete' ? 'הסתיים' : 'ממתין'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {groupedMessages.map((group, gi) => {
          const pi = DISCUSSION_PHASES.find((p) => p.id === group.phase);
          return (
            <div key={gi}>
              {/* Phase divider */}
              <div className="flex items-center gap-3 my-5 first:mt-0">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider bg-slate-800 px-3 py-1 rounded-full">
                  {pi?.labelHe || group.phase}
                </span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              {group.msgs.map((msg, mi) => {
                const member = getMember(msg.memberId);
                if (!member) return null;

                const isModerator = msg.type === 'moderator';
                const isSideChat = msg.type === 'side-chat';
                const isActive = activeSpeakerId === msg.memberId && mi === group.msgs.length - 1;
                const isLast = msg.id === messages[messages.length - 1]?.id;

                if (isModerator) {
                  return (
                    <div key={msg.id} className="text-center py-3">
                      <span className="text-xs text-indigo-400 italic bg-indigo-500/10 px-3 py-1.5 rounded-full">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`mb-4 animate-slide-in ${isSideChat ? 'opacity-50 mr-6' : ''}`}>
                    <div className={`rounded-2xl p-4 ${
                      isActive
                        ? 'bg-indigo-500/10 border border-indigo-500/20'
                        : 'bg-slate-800/60 border border-slate-700/30'
                    }`}>
                      {/* Member header */}
                      <div className="flex items-center gap-2.5 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm"
                          style={{ background: member.color }}
                        >
                          {member.role.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{member.name}</span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{ color: member.color, background: member.color + '20' }}
                            >
                              {member.role}
                            </span>
                          </div>
                        </div>
                        {isActive && (
                          <span className="text-[9px] text-indigo-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            מדבר
                          </span>
                        )}
                      </div>

                      {/* Message content */}
                      <div className="text-[13px] text-slate-200 leading-relaxed whitespace-pre-wrap mr-10">
                        {msg.content}
                        {isActive && isLast && (
                          <span className="inline-block w-1 h-4 bg-indigo-500 mr-0.5 animate-typing" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="text-center mt-16">
            <div className="text-4xl mb-3">💬</div>
            <div className="text-slate-400 text-sm">הדיון טרם התחיל</div>
            <div className="text-slate-600 text-xs mt-1">כאן תראה את כל השיחה</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {members.slice(0, 5).map((m) => (
            <div
              key={m.id}
              className="w-5 h-5 rounded-full text-[7px] text-white font-bold flex items-center justify-center"
              style={{ background: m.color }}
              title={`${m.name} (${m.role})`}
            >
              {m.role.substring(0, 1)}
            </div>
          ))}
          {members.length > 5 && <span className="text-[10px] text-slate-500">+{members.length - 5}</span>}
        </div>
        <span className="text-[10px] text-slate-500">{messages.length} הודעות</span>
      </div>
    </div>
  );
}
