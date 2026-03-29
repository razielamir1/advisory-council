import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiscussionContext } from '../../contexts/DiscussionContext';
import { useSSE } from '../../hooks/useSSE';
import Character from './Character';
import SpeechBubble from './SpeechBubble';
import DiscussionPanel from './DiscussionPanel';
import ProgressBar from './ProgressBar';
import ThemeToggle from '../shared/ThemeToggle';
import AccessibilityMenu from '../shared/AccessibilityMenu';
import InteractionBar from './InteractionBar';
import DirectMessageModal from './DirectMessageModal';
import type { CouncilMember } from '../../../shared/types';

const SEAT_POSITIONS = [
  { x: 42, y: 18 },
  { x: 62, y: 24 },
  { x: 68, y: 44 },
  { x: 62, y: 64 },
  { x: 42, y: 70 },
  { x: 22, y: 64 },
  { x: 16, y: 44 },
  { x: 22, y: 24 },
];

export default function OfficeScene() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useDiscussionContext();
  const { isConnected, error: sseError } = useSSE(id || null, dispatch);
  const [selectedMember, setSelectedMember] = useState<CouncilMember | null>(null);
  const [showKeyPoints, setShowKeyPoints] = useState(false);

  const handleDirectSend = useCallback(async (type: string, content: string, targetMemberId: string) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const storedKey = localStorage.getItem('advisory-council-api-key');
    if (storedKey) headers['x-api-key'] = storedKey;
    await fetch(`/api/discussion/${id}/interact`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ type, content, targetMemberId }),
    });
  }, [id]);

  const activeMessage = state.messages.find(
    (m) => m.memberId === state.activeSpeakerId && m.id === state.messages[state.messages.length - 1]?.id
  );

  return (
    <div className="h-screen bg-slate-950 flex">
      {/* Office + Interaction column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Office area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Top bar */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur rounded-lg px-3 py-1.5 text-xs border border-slate-700/50">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : state.status === 'error' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-slate-300">
                {isConnected ? 'מחובר' : state.status === 'error' ? 'שגיאה' : 'מתחבר...'}
              </span>
            </div>
            <ThemeToggle />
          </div>

          <button
            onClick={() => navigate('/start')}
            className="absolute top-4 right-4 z-20 bg-slate-900/80 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
          >
            חזרה
          </button>

          {/* Progress Bar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-96 max-w-[50vw]">
            <ProgressBar currentPhase={state.currentPhase} />
          </div>

          {/* Office background */}
          <div className="w-full h-full relative bg-gradient-to-b from-slate-900 to-slate-950">
            {/* Floor grid */}
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, #475569 50px, #475569 51px), repeating-linear-gradient(0deg, transparent, transparent 50px, #475569 50px, #475569 51px)' }} />

            {/* Boardroom Table */}
            <div
              className="absolute border border-amber-800/30 rounded-[50%] bg-gradient-to-br from-amber-900/20 to-amber-950/20"
              style={{ left: '25%', top: '30%', width: '35%', height: '35%' }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-slate-700 text-xs tracking-wider uppercase">Advisory Council</span>
              </div>
            </div>

            {/* Whiteboard — clickable */}
            <button
              onClick={() => setShowKeyPoints(true)}
              className="absolute right-4 top-16 w-44 h-32 bg-slate-800/50 border border-slate-700/50 rounded-lg p-2 text-right cursor-pointer hover:bg-slate-800/70 hover:border-slate-600 transition-all group"
            >
              <div className="text-[10px] text-slate-500 font-mono">
                {state.currentPhase === 'research' ? (
                  <>
                    <div className="text-cyan-400">Research Notes:</div>
                    <div className="mt-1 text-slate-500">Analyzing data...</div>
                  </>
                ) : (
                  <>
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Key Points:</span>
                      <span className="text-slate-600 group-hover:text-slate-400 transition-colors">לחץ להרחבה →</span>
                    </div>
                    {state.messages.slice(-3).map((m) => {
                      const member = state.members.find(mb => mb.id === m.memberId);
                      return (
                        <div key={m.id} className="truncate text-slate-600 mt-0.5">
                          <span style={{ color: member?.color || '#6366f1' }}>{member?.role || '?'}</span>: {m.content.substring(0, 30)}...
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </button>

            {/* Coffee Corner */}
            <div className="absolute left-4 top-16 text-2xl flex flex-col items-center gap-1 opacity-50">
              <span>☕</span>
              <span className="text-[9px] text-slate-600">Break Room</span>
            </div>

            {/* Dev Room */}
            <div className="absolute right-4 bottom-8 w-40 h-24 flex flex-col gap-1">
              <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded flex items-center justify-center">
                <span className="text-[9px] text-green-500 font-mono">$ research --market-data</span>
              </div>
              <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded flex items-center justify-center">
                <span className="text-[9px] text-blue-400 font-mono">Analytics</span>
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
                    seatIndex={i}
                    onClickMember={setSelectedMember}
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

            {/* Waiting state */}
            {state.members.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {state.status === 'error' ? (
                    <>
                      <div className="text-4xl mb-4">⚠️</div>
                      <div className="text-red-400 text-lg mb-2">שגיאה בהתחברות</div>
                      <div className="text-slate-400 text-sm mb-4">{sseError || 'לא ניתן להתחבר לשרת'}</div>
                      <button
                        onClick={() => navigate('/start')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl transition-colors"
                      >
                        נסה שוב
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Spinner */}
                      <div className="flex justify-center mb-6">
                        <svg
                          className="w-14 h-14 text-indigo-500 animate-spin"
                          viewBox="0 0 50 50"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-20"
                            cx="25"
                            cy="25"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="5"
                          />
                          <path
                            className="opacity-90"
                            fill="currentColor"
                            d="M25 5a20 20 0 0 1 14.14 5.86l-3.54 3.54A15 15 0 0 0 25 10V5z"
                          />
                        </svg>
                      </div>
                      <div className="text-slate-300 text-lg mb-2">מכינים את חדר הישיבות...</div>
                      <div className="text-slate-500 text-sm">המומחים בדרך</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interaction Bar */}
        <InteractionBar
          discussionId={id || ''}
          status={state.status}
          hasApiKey={true}
        />
      </div>

      {/* Discussion Panel */}
      <DiscussionPanel
        messages={state.messages}
        members={state.members}
        currentPhase={state.currentPhase}
        status={state.status}
        activeSpeakerId={state.activeSpeakerId}
      />

      {/* Direct message modal */}
      {selectedMember && (
        <DirectMessageModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onSend={handleDirectSend}
        />
      )}

      {/* Key Points Panel */}
      {showKeyPoints && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowKeyPoints(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] shadow-2xl animate-bubble-in flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Key Points — נקודות מפתח</h2>
                <p className="text-slate-400 text-xs mt-1">
                  {state.messages.length} הודעות | שלב: {state.currentPhase}
                </p>
              </div>
              <button
                onClick={() => setShowKeyPoints(false)}
                className="text-slate-500 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {state.messages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <div className="text-3xl mb-2">📋</div>
                  <div>הדיון טרם התחיל</div>
                </div>
              ) : (
                state.messages.map((msg) => {
                  const member = state.members.find(m => m.id === msg.memberId);
                  if (msg.type === 'moderator') {
                    return (
                      <div key={msg.id} className="text-center">
                        <span className="text-xs text-indigo-400 italic bg-indigo-500/10 px-3 py-1 rounded-full">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={msg.id} className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                          style={{ background: member?.color || '#6366f1' }}
                        >
                          {(member?.role || '?').substring(0, 2)}
                        </div>
                        <span className="text-sm font-semibold text-white">{member?.name || 'Unknown'}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: member?.color || '#6366f1', background: (member?.color || '#6366f1') + '20' }}>
                          {member?.role || msg.memberId}
                        </span>
                        <span className="text-[9px] text-slate-600 mr-auto">{msg.phase}</span>
                      </div>
                      <div className="text-[13px] text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Accessibility */}
      <AccessibilityMenu />
    </div>
  );
}
