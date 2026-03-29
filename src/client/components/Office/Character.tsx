import { memo } from 'react';
import type { CouncilMember } from '../../../shared/types';

interface CharacterProps {
  member: CouncilMember;
  position: { x: number; y: number };
  isSpeaking: boolean;
  activity: string;
  seatIndex?: number;
  onClickMember?: (member: CouncilMember) => void;
}

// Hair styles per role
const HAIR_STYLES: Record<string, { type: 'short' | 'parted' | 'slick' | 'curly' | 'bun'; color: string }> = {
  CEO: { type: 'slick', color: '#1a1a2e' },
  CTO: { type: 'curly', color: '#3b2507' },
  CFO: { type: 'parted', color: '#2d2d2d' },
  CMO: { type: 'bun', color: '#5c2d0e' },
  COO: { type: 'short', color: '#1a1a2e' },
  CPO: { type: 'parted', color: '#4a2010' },
  CDO: { type: 'short', color: '#2d2d2d' },
};

const SKIN_TONES: Record<string, string> = {
  CEO: '#f0c8a0',
  CTO: '#d4a574',
  CFO: '#f5d6b8',
  CMO: '#e8b88a',
  COO: '#f0c8a0',
  CPO: '#dbb896',
  CDO: '#c8a882',
};

export default memo(function Character({ member, position, isSpeaking, activity, seatIndex = 0, onClickMember }: CharacterProps) {
  const animClass = isSpeaking
    ? 'animate-speaking'
    : activity === 'thinking'
      ? 'animate-thinking'
      : activity === 'walking'
        ? 'animate-walk'
        : 'animate-breathe';

  const skin = SKIN_TONES[member.role] || '#f0c8a0';
  const hair = HAIR_STYLES[member.role] || { type: 'short' as const, color: '#1a1a2e' };
  const hasGlasses = member.avatarAccessory === 'glasses';
  const hasTie = member.avatarAccessory === 'tie';

  return (
    <div
      onClick={() => onClickMember?.(member)}
      className={`absolute transition-all duration-700 ease-out group cursor-pointer ${isSpeaking ? 'z-10' : 'z-5'} hover:scale-110`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        animation: `seatIn 0.6s ease-out ${seatIndex * 0.15}s both`,
      }}
      title={`לחץ לדבר עם ${member.name} (${member.role})`}
    >
      {/* Glow when speaking */}
      {isSpeaking && (
        <div
          className="absolute -inset-4 rounded-full opacity-25 animate-pulse"
          style={{ background: `radial-gradient(circle, ${member.color}, transparent)` }}
        />
      )}

      {/* Lego-style character SVG */}
      <div className={animClass}>
        <svg width="56" height="72" viewBox="0 0 56 72" className="drop-shadow-lg">
          {/* === LEGS === */}
          <rect x="16" y="56" width="10" height="14" rx="2" fill={darken(member.color, 40)} />
          <rect x="30" y="56" width="10" height="14" rx="2" fill={darken(member.color, 40)} />
          {/* Shoes */}
          <rect x="14" y="66" width="13" height="5" rx="2.5" fill="#1a1a2e" />
          <rect x="29" y="66" width="13" height="5" rx="2.5" fill="#1a1a2e" />

          {/* === TORSO (jacket/shirt) === */}
          <rect x="12" y="36" width="32" height="22" rx="4" fill={member.color} />
          {/* Shirt V-neck */}
          <polygon points="24,36 28,44 32,36" fill="#ffffff" opacity="0.9" />
          {/* Jacket lapels */}
          <polygon points="12,36 24,36 20,48" fill={darken(member.color, 20)} opacity="0.6" />
          <polygon points="44,36 32,36 36,48" fill={darken(member.color, 20)} opacity="0.6" />
          {/* Tie */}
          {hasTie && (
            <>
              <rect x="26.5" y="38" width="3" height="4" rx="0.5" fill={darken(member.color, 60)} />
              <polygon points="28,42 25.5,52 28,50 30.5,52" fill={darken(member.color, 60)} />
            </>
          )}
          {/* Buttons (if no tie) */}
          {!hasTie && (
            <>
              <circle cx="28" cy="42" r="1" fill={darken(member.color, 30)} />
              <circle cx="28" cy="47" r="1" fill={darken(member.color, 30)} />
              <circle cx="28" cy="52" r="1" fill={darken(member.color, 30)} />
            </>
          )}

          {/* === ARMS === */}
          {/* Left arm */}
          <rect x="4" y="37" width="9" height="18" rx="4" fill={member.color} />
          <ellipse cx="8" cy="56" rx="4.5" ry="4" fill={skin} />
          {/* Right arm */}
          <rect x="43" y="37" width="9" height="18" rx="4" fill={member.color} />
          <ellipse cx="48" cy="56" rx="4.5" ry="4" fill={skin} />

          {/* === NECK === */}
          <rect x="22" y="30" width="12" height="8" rx="2" fill={skin} />

          {/* === HEAD === */}
          <ellipse cx="28" cy="20" rx="13" ry="14" fill={skin} />

          {/* === HAIR === */}
          {hair.type === 'slick' && (
            <path d="M15,18 Q15,5 28,4 Q41,5 41,18 L41,14 Q41,6 28,5 Q15,6 15,14 Z" fill={hair.color} />
          )}
          {hair.type === 'short' && (
            <path d="M15,20 Q15,6 28,5 Q41,6 41,20 L40,16 Q39,8 28,7 Q17,8 16,16 Z" fill={hair.color} />
          )}
          {hair.type === 'parted' && (
            <>
              <path d="M15,20 Q15,6 28,5 Q41,6 41,20 L40,15 Q39,7 28,6 Q17,7 16,15 Z" fill={hair.color} />
              <line x1="24" y1="5" x2="22" y2="14" stroke={lighten(hair.color, 20)} strokeWidth="0.5" />
            </>
          )}
          {hair.type === 'curly' && (
            <>
              <path d="M14,22 Q12,6 28,4 Q44,6 42,22" fill={hair.color} />
              <circle cx="16" cy="14" r="3" fill={hair.color} />
              <circle cx="22" cy="9" r="3" fill={hair.color} />
              <circle cx="28" cy="7" r="3" fill={hair.color} />
              <circle cx="34" cy="9" r="3" fill={hair.color} />
              <circle cx="40" cy="14" r="3" fill={hair.color} />
            </>
          )}
          {hair.type === 'bun' && (
            <>
              <path d="M15,20 Q15,6 28,5 Q41,6 41,20 L40,15 Q39,7 28,6 Q17,7 16,15 Z" fill={hair.color} />
              <circle cx="28" cy="4" r="5" fill={hair.color} />
            </>
          )}

          {/* === EARS === */}
          <ellipse cx="15" cy="22" rx="2.5" ry="3" fill={skin} />
          <ellipse cx="41" cy="22" rx="2.5" ry="3" fill={skin} />

          {/* === FACE === */}
          {/* Eyes */}
          {hasGlasses ? (
            <>
              {/* Glasses frames */}
              <rect x="19" y="17" width="8" height="7" rx="2" fill="none" stroke="#64748b" strokeWidth="1.2" />
              <rect x="29" y="17" width="8" height="7" rx="2" fill="none" stroke="#64748b" strokeWidth="1.2" />
              <line x1="27" y1="20" x2="29" y2="20" stroke="#64748b" strokeWidth="1" />
              <line x1="15" y1="20" x2="19" y2="20" stroke="#64748b" strokeWidth="0.8" />
              <line x1="37" y1="20" x2="41" y2="20" stroke="#64748b" strokeWidth="0.8" />
              {/* Eyes behind glasses */}
              <ellipse cx="23" cy="20" rx="1.8" ry="2" fill="#1e293b" />
              <ellipse cx="33" cy="20" rx="1.8" ry="2" fill="#1e293b" />
              <circle cx="23.5" cy="19.5" r="0.6" fill="white" />
              <circle cx="33.5" cy="19.5" r="0.6" fill="white" />
            </>
          ) : (
            <>
              {/* Regular eyes */}
              <ellipse cx="22" cy="20" rx="2.2" ry="2.5" fill="white" />
              <ellipse cx="34" cy="20" rx="2.2" ry="2.5" fill="white" />
              <ellipse cx="22.5" cy="20" rx="1.5" ry="1.8" fill="#1e293b" />
              <ellipse cx="34.5" cy="20" rx="1.5" ry="1.8" fill="#1e293b" />
              <circle cx="23" cy="19.5" r="0.5" fill="white" />
              <circle cx="35" cy="19.5" r="0.5" fill="white" />
            </>
          )}

          {/* Eyebrows */}
          <line x1="19" y1="15" x2="25" y2="14.5" stroke={hair.color} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="31" y1="14.5" x2="37" y2="15" stroke={hair.color} strokeWidth="1.2" strokeLinecap="round" />

          {/* Nose */}
          <ellipse cx="28" cy="24" rx="1.5" ry="1" fill={darken(skin, 20)} opacity="0.4" />

          {/* Mouth */}
          {isSpeaking ? (
            <ellipse cx="28" cy="28" rx="3.5" ry="2.5" fill="#c0392b" opacity="0.8">
              <animate attributeName="ry" values="2.5;1.5;2.5" dur="0.3s" repeatCount="indefinite" />
            </ellipse>
          ) : (
            <path d="M24,27 Q28,30 32,27" fill="none" stroke="#a0522d" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          )}

          {/* === BADGE / NAME TAG === */}
          <rect x="33" y="40" width="8" height="5" rx="1" fill="white" opacity="0.8" />
          <text x="37" y="44" textAnchor="middle" fontSize="3.5" fill={member.color} fontWeight="bold">
            {member.role.substring(0, 3)}
          </text>
        </svg>
      </div>

      {/* Name & Role */}
      <div className="text-center mt-0.5 min-w-[80px]">
        <div
          className="text-[10px] font-bold leading-tight px-2 py-0.5 rounded-full inline-block"
          style={{ color: member.color, background: member.color + '15' }}
        >
          {member.role}
        </div>
        <div className="text-[9px] text-gray-500 dark:text-gray-500 text-gray-400 leading-tight mt-0.5">{member.name}</div>
      </div>

      {/* Hover card */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 bg-gray-900 dark:bg-gray-900 bg-white border border-gray-700 dark:border-gray-700 border-gray-200 rounded-xl text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-2xl">
        <div className="font-bold text-white dark:text-white text-gray-900">{member.name}</div>
        {member.nickname && <div className="text-gray-400 italic">"{member.nickname}"</div>}
        <div style={{ color: member.color }} className="font-medium mt-1">{member.domainTitle}</div>
        <div className="text-gray-500 mt-1 leading-relaxed">{member.background.substring(0, 150)}...</div>
        <div className="text-gray-600 mt-2 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
          {member.yearsExperience}+ שנות ניסיון
        </div>
      </div>
    </div>
  );
});

function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
  const b = Math.min(255, (num & 0x0000ff) + percent);
  return `rgb(${r}, ${g}, ${b})`;
}

function darken(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  const r = Math.max(0, (num >> 16) - percent);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - percent);
  const b = Math.max(0, (num & 0x0000ff) - percent);
  return `rgb(${r}, ${g}, ${b})`;
}
