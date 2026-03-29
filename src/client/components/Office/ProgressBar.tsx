import { memo } from 'react';
import { DISCUSSION_PHASES, type DiscussionPhase } from '../../../shared/types';

interface ProgressBarProps {
  currentPhase: DiscussionPhase;
}

export default memo(function ProgressBar({ currentPhase }: ProgressBarProps) {
  const currentIndex = DISCUSSION_PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl px-4 py-2.5">
      <div className="flex items-center gap-1">
        {DISCUSSION_PHASES.map((phase, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={phase.id} className="flex items-center flex-1 group relative">
              {/* Segment */}
              <div
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  isDone ? 'bg-indigo-500' : isCurrent ? 'bg-indigo-500/50 animate-pulse' : 'bg-gray-800'
                }`}
              />

              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-[9px] text-gray-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {phase.labelHe}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current phase label */}
      <div className="text-center mt-1">
        <span className="text-[10px] text-gray-500">
          {DISCUSSION_PHASES[currentIndex]?.labelHe || ''}
          {' '}({currentIndex + 1}/{DISCUSSION_PHASES.length})
        </span>
      </div>
    </div>
  );
});
