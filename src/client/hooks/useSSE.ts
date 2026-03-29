import { useEffect, useRef, useState, useCallback } from 'react';
import type { DiscussionAction } from '../contexts/DiscussionContext';

type Speed = 'fast' | 'normal' | 'slow';

const SPEED_DELAYS: Record<Speed, number> = {
  fast: 0,
  normal: 30,
  slow: 80,
};

export function useSSE(
  discussionId: string | null,
  dispatch: React.Dispatch<DiscussionAction>,
  speed: Speed = 'fast'
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef<EventSource | null>(null);
  const speedRef = useRef(speed);
  const tokenQueueRef = useRef<{ messageId: string; token: string }[]>([]);
  const processingRef = useRef(false);

  // Keep speed ref in sync without re-creating the effect
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const processTokenQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    while (tokenQueueRef.current.length > 0) {
      const item = tokenQueueRef.current.shift()!;
      dispatch({ type: 'APPEND_TOKEN', payload: item });

      const delayMs = SPEED_DELAYS[speedRef.current];
      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }

    processingRef.current = false;
  }, [dispatch]);

  useEffect(() => {
    if (!discussionId) return;

    const source = new EventSource(`/api/discussion/${discussionId}/stream`);
    sourceRef.current = source;

    source.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const { type, data } = parsed;

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
            // Queue tokens and process at the selected speed
            tokenQueueRef.current.push({ messageId: data.messageId, token: data.token });
            processTokenQueue();
            break;
          case 'member-end':
            // Flush remaining tokens immediately
            tokenQueueRef.current = [];
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
            dispatch({
              type: 'ADD_MESSAGE',
              payload: { ...data, type: 'side-chat' },
            });
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
      sourceRef.current = null;
    };

    return () => {
      source.close();
      sourceRef.current = null;
      tokenQueueRef.current = [];
      setIsConnected(false);
    };
  }, [discussionId, dispatch, processTokenQueue]);

  return { isConnected, error };
}
