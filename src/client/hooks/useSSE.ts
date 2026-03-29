import { useEffect, useRef, useState } from 'react';
import type { DiscussionAction } from '../contexts/DiscussionContext';

type Speed = 'fast' | 'normal' | 'slow';

// Milliseconds per CHARACTER (not per token — Gemini sends big chunks)
const SPEED_CHAR_DELAYS: Record<Speed, number> = {
  fast: 0,    // instant
  normal: 15, // ~66 chars/sec — readable typing
  slow: 40,   // ~25 chars/sec — slow deliberate typing
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

    // Character-level queue for typing effect
    let charQueue: { messageId: string; char: string }[] = [];
    let draining = false;
    let aborted = false;

    async function drainChars() {
      if (draining) return;
      draining = true;

      while (charQueue.length > 0 && !aborted) {
        const delayMs = SPEED_CHAR_DELAYS[speedRef.current];

        if (delayMs === 0) {
          // Fast mode: flush everything at once
          const batch = charQueue.splice(0);
          const byMsg = new Map<string, string>();
          for (const c of batch) {
            byMsg.set(c.messageId, (byMsg.get(c.messageId) || '') + c.char);
          }
          for (const [messageId, token] of byMsg) {
            dispatch({ type: 'APPEND_TOKEN', payload: { messageId, token } });
          }
        } else {
          // Normal/slow: drip character by character
          const item = charQueue.shift()!;
          dispatch({ type: 'APPEND_TOKEN', payload: { messageId: item.messageId, token: item.char } });
          await new Promise(r => setTimeout(r, delayMs));
        }
      }

      draining = false;
    }

    source.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

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
            // Split token chunk into individual characters for typing effect
            const chars = (data.token as string).split('');
            for (const char of chars) {
              charQueue.push({ messageId: data.messageId, char });
            }
            drainChars();
            break;
          }

          case 'member-end':
            // Flush remaining chars and set full content
            charQueue = [];
            draining = false;
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

          case 'discussion-complete':
            dispatch({ type: 'SET_SUMMARY', payload: data.summary });
            break;

          case 'error':
            dispatch({ type: 'SET_ERROR', payload: data.message });
            break;
        }
      } catch {
        // Ignore malformed events
      }
    };

    source.onerror = () => {
      setIsConnected(false);
      setError('Connection lost.');
      source.close();
    };

    return () => {
      aborted = true;
      source.close();
      charQueue = [];
      setIsConnected(false);
    };
  }, [discussionId, dispatch]);

  return { isConnected, error };
}
