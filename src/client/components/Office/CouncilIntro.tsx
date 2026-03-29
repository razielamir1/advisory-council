import type { CouncilMember } from '../../../shared/types';

interface CouncilIntroProps {
  members: CouncilMember[];
  idea: string;
}

export default function CouncilIntro({ members, idea }: CouncilIntroProps) {
  if (members.length === 0) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/95 backdrop-blur animate-fade-in">
      <div className="max-w-2xl w-full px-6 text-center">
        <div className="text-slate-400 text-sm mb-3">המועצה התכנסה לדון ב:</div>
        <div className="text-white font-medium text-lg mb-8 max-w-md mx-auto leading-relaxed">
          "{idea.substring(0, 120)}{idea.length > 120 ? '...' : ''}"
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {members.map((m, i) => (
            <div
              key={m.id}
              className="flex flex-col items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[10px] font-bold mb-2 shadow-lg"
                style={{ background: m.color, boxShadow: `0 4px 15px ${m.color}30` }}
              >
                {m.role.substring(0, 3)}
              </div>
              <div className="text-white text-xs font-semibold">{m.name.split(' ')[0]}</div>
              <div className="text-[9px]" style={{ color: m.color }}>{m.role}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M12 2a10 10 0 0 1 7.07 2.93l-2.12 2.12A7 7 0 0 0 12 5V2z" />
          </svg>
          <span>הדיון מתחיל...</span>
        </div>
      </div>
    </div>
  );
}
