import { useEffect, useRef, useState } from 'react';
import type { DiscussionAction } from '../contexts/DiscussionContext';

export function useSSE(
  discussionId: string | null,
  dispatch: React.Dispatch<DiscussionAction>
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

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
            dispatch({ type: 'APPEND_TOKEN', payload: { messageId: data.messageId, token: data.token } });
            break;
          case 'member-end':
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
      setError('Connection lost. Reconnecting...');
    };

    return () => {
      source.close();
      sourceRef.current = null;
      setIsConnected(false);
    };
  }, [discussionId, dispatch]);

  return { isConnected, error };
}
