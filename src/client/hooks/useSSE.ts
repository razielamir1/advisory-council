import { useEffect, useRef, useState } from 'react';
import type { DiscussionAction } from '../contexts/DiscussionContext';

type Speed = 'fast' | 'normal' | 'slow';

const SPEED_DELAYS: Record<Speed, number> = {
  fast: 0,
  normal: 40,
  slow: 100,
};

export function useSSE(
  discussionId: string | null,
  dispatch: React.Dispatch<DiscussionAction>,
  speed: Speed = 'fast'
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const speedRef = useRef(speed);

  // Keep speed in sync without re-creating effects
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    if (!discussionId) return;

    const source = new EventSource(`/api/discussion/${discussionId}/stream`);
    let tokenQueue: { messageId: string; token: string }[] = [];
    let draining = false;

    async function drainQueue() {
      if (draining) return;
      draining = true;
      while (tokenQueue.length > 0) {
        const item = tokenQueue.shift()!;
        dispatch({ type: 'APPEND_TOKEN', payload: item });
        const ms = SPEED_DELAYS[speedRef.current];
        if (ms > 0) await new Promise(r => setTimeout(r, ms));
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

          case 'token':
            tokenQueue.push({ messageId: data.messageId, token: data.token });
            drainQueue();
            break;

          case 'member-end':
            // Flush queue and set full content
            tokenQueue = [];
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
      source.close();
      tokenQueue = [];
      setIsConnected(false);
    };
  }, [discussionId, dispatch]);

  return { isConnected, error };
}
