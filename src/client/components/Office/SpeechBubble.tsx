interface SpeechBubbleProps {
  content: string;
  memberName: string;
  memberRole: string;
  color: string;
  position: { x: number; y: number };
}

export default function SpeechBubble({ content, memberName, memberRole, color, position }: SpeechBubbleProps) {
  return (
    <div
      className="absolute z-20 animate-bubble-in max-w-xs"
      style={{
        left: `${Math.min(Math.max(position.x, 15), 70)}%`,
        top: `${Math.max(position.y, 5)}%`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div
        className="bg-gray-900/95 backdrop-blur border rounded-2xl p-4 shadow-xl"
        style={{ borderColor: color + '40' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-xs font-bold" style={{ color }}>{memberRole}</span>
          <span className="text-xs text-gray-500">{memberName}</span>
        </div>

        {/* Content */}
        <div className="text-sm text-gray-200 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
          {content}
          <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-typing" />
        </div>
      </div>

      {/* Arrow pointing down */}
      <div className="flex justify-center">
        <div
          className="w-3 h-3 rotate-45 -mt-1.5"
          style={{ background: color + '40' }}
        />
      </div>
    </div>
  );
}
