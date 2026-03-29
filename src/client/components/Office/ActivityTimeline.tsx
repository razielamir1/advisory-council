import { memo } from 'react';
import type { DiscussionMessage, CouncilMember } from '../../../shared/types';

interface ActivityTimelineProps {
  messages: DiscussionMessage[];
  members: CouncilMember[];
  activeSpeakerId: string | null;
}

export default memo(function ActivityTimeline({ messages, members, activeSpeakerId }: ActivityTimelineProps) {
  if (messages.length === 0) return null;

  const getMember = (id: string) => members.find((m) => m.id === id);

  // Calculate relative heights — longer messages = taller bars
  const maxLen = Math.max(...messages.map((m) => m.content.length), 1);

  return (
    <div className="absolute left-2 top-20 bottom-20 w-8 z-10 flex flex-col gap-0.5 opacity-60 hover:opacity-100 transition-opacity" title="Activity Timeline">
      {messages.slice(-20).map((msg) => {
        const member = getMember(msg.memberId);
        const height = Math.max(4, Math.min(20, (msg.content.length / maxLen) * 20));
        const isActive = msg.memberId === activeSpeakerId;

        return (
          <div
            key={msg.id}
            className={`w-full rounded-sm transition-all duration-300 ${isActive ? 'ring-1 ring-white/30' : ''}`}
            style={{
              height: `${height}px`,
              background: member?.color || '#6366f1',
              opacity: isActive ? 1 : 0.6,
            }}
            title={`${member?.role || '?'}: ${msg.content.substring(0, 50)}...`}
          />
        );
      })}
    </div>
  );
});
