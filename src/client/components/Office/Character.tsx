import { memo } from 'react';
import type { CouncilMember } from '../../../shared/types';

interface CharacterProps {
  member: CouncilMember;
  position: { x: number; y: number };
  isSpeaking: boolean;
  activity: string;
}

const ACCESSORIES: Record<string, string> = {
  glasses: 'M-3,-1 L-1,-1 M1,-1 L3,-1',
  tie: 'M0,4 L-1,8 L0,7 L1,8 Z',
  headset: 'M-4,-2 Q-5,-4 -3,-5 M3,-5 Q5,-4 4,-2',
};

export default memo(function Character({ member, position, isSpeaking, activity }: CharacterProps) {
  const animClass = isSpeaking
    ? 'animate-speaking'
    : activity === 'thinking'
      ? 'animate-thinking'
      : activity === 'walking'
        ? 'animate-walk'
        : 'animate-breathe';

  return (
    <div
      className={`absolute transition-all duration-700 ease-out group cursor-pointer ${isSpeaking ? 'z-10' : 'z-5'}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Glow when speaking */}
      {isSpeaking && (
        <div
          className="absolute -inset-3 rounded-full opacity-20 animate-pulse"
          style={{ background: `radial-gradient(circle, ${member.color}, transparent)` }}
        />
      )}

      {/* Character SVG */}
      <div className={animClass}>
        <svg width="48" height="60" viewBox="-15 -15 30 40" className="drop-shadow-lg">
          {/* Body */}
          <rect x="-8" y="4" width="16" height="14" rx="4" fill={member.color} opacity="0.9" />

          {/* Head */}
          <circle cx="0" cy="-2" r="8" fill={member.color} />
          <circle cx="0" cy="-2" r="7" fill={lighten(member.color, 30)} />

          {/* Eyes */}
          <circle cx="-2.5" cy="-3" r="1" fill="#1a1a2e" />
          <circle cx="2.5" cy="-3" r="1" fill="#1a1a2e" />

          {/* Mouth */}
          {isSpeaking ? (
            <ellipse cx="0" cy="0.5" rx="2" ry="1.5" fill="#1a1a2e" className="animate-speaking" />
          ) : (
            <line x1="-1.5" y1="1" x2="1.5" y2="1" stroke="#1a1a2e" strokeWidth="0.8" strokeLinecap="round" />
          )}

          {/* Accessory */}
          {member.avatarAccessory === 'glasses' && (
            <>
              <circle cx="-2.5" cy="-3" r="2" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
              <circle cx="2.5" cy="-3" r="2" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
              <line x1="-0.5" y1="-3" x2="0.5" y2="-3" stroke="#94a3b8" strokeWidth="0.5" />
            </>
          )}
          {member.avatarAccessory === 'tie' && (
            <polygon points="0,5 -1.5,10 0,9 1.5,10" fill={darken(member.color, 30)} />
          )}
        </svg>
      </div>

      {/* Name & Role */}
      <div className="text-center mt-0.5 min-w-[80px]">
        <div className="text-[10px] font-bold text-white leading-tight">{member.role}</div>
        <div className="text-[8px] text-gray-500 leading-tight">{member.name}</div>
      </div>

      {/* Hover card */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 border border-gray-700 rounded-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
        <div className="font-bold text-white">{member.name}</div>
        {member.nickname && <div className="text-gray-400 italic">"{member.nickname}"</div>}
        <div style={{ color: member.color }} className="font-medium mt-1">{member.domainTitle}</div>
        <div className="text-gray-500 mt-1 leading-relaxed">{member.background.substring(0, 120)}...</div>
        <div className="text-gray-600 mt-1">{member.yearsExperience}+ שנות ניסיון</div>
      </div>
    </div>
  );
});

function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
  const b = Math.min(255, (num & 0x0000ff) + percent);
  return `rgb(${r}, ${g}, ${b})`;
}

function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - percent);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - percent);
  const b = Math.max(0, (num & 0x0000ff) - percent);
  return `rgb(${r}, ${g}, ${b})`;
}
