import { useEffect, useRef, useState } from 'react';
import type { DiscussionAction } from '../contexts/DiscussionContext';

type Speed = 'fast' | 'normal' | 'slow';

// ms per character — FIXED rate, never speeds up
const SPEED_MS: Record<Speed, number> = {
  fast: 0,
  normal: 18,
  slow: 45,
};

export function useSSE(
  discussionId: string | null,
  dispatch: React.Dispatch<DiscussionAction>,
  speed: Speed = 'fast'
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const speedRef = useRef(speed);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    if (!discussionId) return;

    const source = new EventSource(`/api/discussion/${discussionId}/stream`);

    // Fixed-rate character display using setInterval instead of async loop
    let charBuffer: { messageId: string; char: string }[] = [];
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function startInterval() {
      if (intervalId) return;
      tick(); // first char immediately
      intervalId = setInterval(tick, Math.max(speedRef.current === 'fast' ? 1 : SPEED_MS[speedRef.current], 1));
    }

    function stopInterval() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
    }

    function restartInterval() {
      stopInterval();
      if (charBuffer.length > 0) startInterval();
    }

    function tick() {
      if (charBuffer.length === 0) { stopInterval(); return; }

      const ms = SPEED_MS[speedRef.current];
      if (ms === 0) {
        // Fast: flush all at once
        const all = charBuffer.splice(0);
        const byMsg = new Map<string, string>();
        for (const c of all) byMsg.set(c.messageId, (byMsg.get(c.messageId) || '') + c.char);
        for (const [messageId, token] of byMsg) {
          dispatch({ type: 'APPEND_TOKEN', payload: { messageId, token } });
        }
        stopInterval();
      } else {
        // Normal/slow: exactly 1 char per tick at fixed interval
        const item = charBuffer.shift()!;
        dispatch({ type: 'APPEND_TOKEN', payload: { messageId: item.messageId, token: item.char } });
        // Adjust interval if speed changed
        stopInterval();
        if (charBuffer.length > 0) {
          intervalId = setInterval(tick, SPEED_MS[speedRef.current]);
        }
      }
    }

    source.onopen = () => { setIsConnected(true); setError(null); };

    source.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);

        switch (type) {
          case 'phase-change':
            dispatch({ type: 'CHANGE_PHASE', payload: data.phase });
            if (data.members && Array.isArray(data.members)) {
              dispatch({
                type: 'START_DISCUSSION',
                payload: {
                  id: data.discussionId || '',
                  members: data.members,
                  characterStates: data.characterStates || [],
                },
              });
            }
            break;

          case 'member-start':
            dispatch({ type: 'SET_ACTIVE_SPEAKER', payload: data.memberId });
            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                id: data.messageId,
                memberId: data.memberId,
                phase: data.phase,
                content: '',
                timestamp: Date.now(),
                type: data.messageType || 'speech',
              },
            });
            break;

          case 'token': {
            const chars = (data.token as string).split('');
            for (const char of chars) {
              charBuffer.push({ messageId: data.messageId, char });
            }
            startInterval();
            break;
          }

          case 'member-end':
            // Stop dripping, flush, set final content
            charBuffer = [];
            stopInterval();
            dispatch({
              type: 'COMPLETE_MESSAGE',
              payload: { messageId: data.messageId, fullContent: data.fullContent },
            });
            dispatch({ type: 'SET_ACTIVE_SPEAKER', payload: null });
            break;

          case 'character-move':
            dispatch({ type: 'UPDATE_CHARACTER_STATE', payload: data });
            break;
          case 'guest-join':
            dispatch({ type: 'ADD_GUEST_MEMBER', payload: data.member });
            break;
          case 'side-chat':
            dispatch({ type: 'ADD_MESSAGE', payload: { ...data, type: 'side-chat' } });
            break;
          case 'chairman-input-needed':
            dispatch({ type: 'CHAIRMAN_INPUT_NEEDED', payload: data as any });
            break;
          case 'discussion-complete':
            dispatch({ type: 'SET_SUMMARY', payload: data.summary });
            break;
          case 'error':
            dispatch({ type: 'SET_ERROR', payload: data.message });
            break;
        }
      } catch { /* ignore */ }
    };

    source.onerror = () => {
      setIsConnected(false);
      setError('Connection lost.');
      source.close();
    };

    return () => {
      source.close();
      charBuffer = [];
      stopInterval();
      setIsConnected(false);
    };
  }, [discussionId, dispatch]);

  return { isConnected, error };
}
