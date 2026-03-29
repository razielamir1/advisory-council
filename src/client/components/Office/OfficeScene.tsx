import { useParams } from 'react-router-dom';
import { useDiscussionContext } from '../../contexts/DiscussionContext';
import { useSSE } from '../../hooks/useSSE';
import { DISCUSSION_PHASES } from '../../../shared/types';
import Character from './Character';
import SpeechBubble from './SpeechBubble';
import DiscussionPanel from './DiscussionPanel';
import ProgressBar from './ProgressBar';

// Office area positions (percentages)
const AREAS = {
  boardroom: { x: 30, y: 40, w: 40, h: 30 },
  whiteboard: { x: 78, y: 10, w: 18, h: 35 },
  coffee: { x: 5, y: 8, w: 15, h: 20 },
  'dev-room': { x: 78, y: 55, w: 18, h: 30 },
};

// Character positions around the boardroom table
const SEAT_POSITIONS = [
  { x: 50, y: 22 },  // top center
  { x: 68, y: 28 },  // top right
  { x: 72, y: 45 },  // right
  { x: 68, y: 62 },  // bottom right
  { x: 50, y: 68 },  // bottom center
  { x: 32, y: 62 },  // bottom left
  { x: 28, y: 45 },  // left
  { x: 32, y: 28 },  // top left
];

export default function OfficeScene() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useDiscussionContext();
  const { isConnected } = useSSE(id || null, dispatch);

  const activeMessage = state.messages.find(
    (m) => m.memberId === state.activeSpeakerId && m.id === state.messages[state.messages.length - 1]?.id
  );

  const activeMember = state.members.find((m) => m.id === state.activeSpeakerId);

  return (
    <div className="h-screen bg-gray-950 flex">
      {/* Office View */}
      <div className="flex-1 relative overflow-hidden">
        {/* Connection indicator */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-gray-900/80 backdrop-blur rounded-lg px-3 py-1.5 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
          <span className="text-gray-400">{isConnected ? 'מחובר' : 'מתחבר...'}</span>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-96">
          <ProgressBar currentPhase={state.currentPhase} />
        </div>

        {/* Office Scene */}
        <div className="w-full h-full relative bg-gradient-to-b from-gray-900 to-gray-950">
          {/* Floor */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, #475569 50px, #475569 51px), repeating-linear-gradient(0deg, transparent, transparent 50px, #475569 50px, #475569 51px)' }} />

          {/* Boardroom Table */}
          <div
            className="absolute border border-amber-800/30 rounded-[50%] bg-gradient-to-br from-amber-900/20 to-amber-950/20"
            style={{ left: '25%', top: '30%', width: '35%', height: '35%' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-700 text-xs tracking-wider uppercase">Advisory Council</span>
            </div>
          </div>

          {/* Whiteboard */}
          <div className="absolute right-4 top-8 w-44 h-32 bg-white/5 border border-gray-700/50 rounded-lg p-2">
            <div className="text-[10px] text-gray-600 font-mono">
              {state.currentPhase === 'research' ? (
                <>
                  <div className="text-cyan-500">Research Notes:</div>
                  <div className="mt-1 text-gray-500">Analyzing data...</div>
                </>
              ) : (
                <>
                  <div className="text-gray-500">Key Points:</div>
                  {state.messages.slice(-3).map((m, i) => (
                    <div key={i} className="truncate text-gray-600 mt-0.5">
                      • {m.content.substring(0, 40)}...
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Coffee Corner */}
          <div className="absolute left-4 top-4 text-2xl flex flex-col items-center gap-1 opacity-50">
            <span>☕</span>
            <span className="text-[9px] text-gray-600">Break Room</span>
          </div>

          {/* Dev Room / Screens */}
          <div className="absolute right-4 bottom-8 w-40 h-24 flex flex-col gap-1">
            <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded flex items-center justify-center">
              <span className="text-[9px] text-green-600 font-mono">$ research --market-data</span>
            </div>
            <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded flex items-center justify-center">
              <span className="text-[9px] text-blue-600 font-mono">📊 Analytics</span>
            </div>
          </div>

          {/* Characters */}
          {state.members.map((member, i) => {
            const pos = SEAT_POSITIONS[i % SEAT_POSITIONS.length];
            const charState = state.characterStates.find((cs) => cs.memberId === member.id);
            const isSpeaking = state.activeSpeakerId === member.id;

            return (
              <div key={member.id}>
                <Character
                  member={member}
                  position={pos}
                  isSpeaking={isSpeaking}
                  activity={charState?.activity || (isSpeaking ? 'speaking' : 'sitting')}
                />
                {isSpeaking && activeMessage && (
                  <SpeechBubble
                    content={activeMessage.content}
                    memberName={member.name}
                    memberRole={member.role}
                    color={member.color}
                    position={{ x: pos.x, y: pos.y - 18 }}
                  />
                )}
              </div>
            );
          })}

          {/* Waiting state — no members yet */}
          {state.members.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-pulse">
                <div className="text-4xl mb-4">🏢</div>
                <div className="text-gray-500 text-lg">מכינים את חדר הישיבות...</div>
                <div className="text-gray-600 text-sm mt-2">המומחים בדרך</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discussion Panel (right side) */}
      <DiscussionPanel
        messages={state.messages}
        members={state.members}
        currentPhase={state.currentPhase}
        status={state.status}
      />
    </div>
  );
}
