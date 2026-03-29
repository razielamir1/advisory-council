import { createContext, useContext, useReducer, useMemo, type ReactNode, type Dispatch } from 'react';
import type {
  CouncilMode,
  CouncilMember,
  DiscussionMessage,
  CharacterState,
  DiscussionPhase,
  DiscussionSummary,
  DiscussionLanguage,
  Domain,
} from '../../shared/types';

// ===== State =====
export interface ClientDiscussionState {
  id: string | null;
  domain: Domain | null;
  idea: string;
  mode: CouncilMode;
  language: DiscussionLanguage;
  members: CouncilMember[];
  messages: DiscussionMessage[];
  characterStates: CharacterState[];
  currentPhase: DiscussionPhase;
  activeSpeakerId: string | null;
  status: 'idle' | 'discussing' | 'interactive' | 'summarizing' | 'complete' | 'error';
  summary: DiscussionSummary | null;
  error: string | null;
}

const initialState: ClientDiscussionState = {
  id: null,
  domain: null,
  idea: '',
  mode: 'csuite',
  language: 'he',
  members: [],
  messages: [],
  characterStates: [],
  currentPhase: 'opening',
  activeSpeakerId: null,
  status: 'idle',
  summary: null,
  error: null,
};

// ===== Actions =====
export type DiscussionAction =
  | { type: 'SET_DOMAIN'; payload: Domain }
  | { type: 'SET_IDEA'; payload: string }
  | { type: 'SET_MODE'; payload: CouncilMode }
  | { type: 'SET_LANGUAGE'; payload: DiscussionLanguage }
  | { type: 'START_DISCUSSION'; payload: { id: string; members: CouncilMember[]; characterStates: CharacterState[] } }
  | { type: 'ADD_MESSAGE'; payload: DiscussionMessage }
  | { type: 'APPEND_TOKEN'; payload: { messageId: string; token: string } }
  | { type: 'COMPLETE_MESSAGE'; payload: { messageId: string; fullContent: string } }
  | { type: 'CHANGE_PHASE'; payload: DiscussionPhase }
  | { type: 'SET_ACTIVE_SPEAKER'; payload: string | null }
  | { type: 'UPDATE_CHARACTER_STATE'; payload: CharacterState }
  | { type: 'ADD_GUEST_MEMBER'; payload: CouncilMember }
  | { type: 'SET_SUMMARY'; payload: DiscussionSummary }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_STATUS'; payload: ClientDiscussionState['status'] }
  | { type: 'RESET' };

function reducer(state: ClientDiscussionState, action: DiscussionAction): ClientDiscussionState {
  switch (action.type) {
    case 'SET_DOMAIN':
      return { ...state, domain: action.payload };
    case 'SET_IDEA':
      return { ...state, idea: action.payload };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'START_DISCUSSION':
      return {
        ...state,
        id: action.payload.id || state.id, // preserve existing id
        members: action.payload.members.length > 0 ? action.payload.members : state.members,
        characterStates: action.payload.characterStates.length > 0 ? action.payload.characterStates : state.characterStates,
        status: 'discussing',
        messages: state.messages.length > 0 ? state.messages : [], // don't wipe if already streaming
        summary: null,
        error: null,
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'APPEND_TOKEN': {
      // O(1) fast path: the streamed message is always the last one
      const msgs = state.messages;
      const last = msgs[msgs.length - 1];
      if (last && last.id === action.payload.messageId) {
        const updated = [...msgs];
        updated[updated.length - 1] = { ...last, content: last.content + action.payload.token };
        return { ...state, messages: updated };
      }
      // Fallback O(n)
      return {
        ...state,
        messages: msgs.map((m) =>
          m.id === action.payload.messageId ? { ...m, content: m.content + action.payload.token } : m
        ),
      };
    }
    case 'COMPLETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.messageId ? { ...m, content: action.payload.fullContent } : m
        ),
      };
    case 'CHANGE_PHASE':
      return { ...state, currentPhase: action.payload };
    case 'SET_ACTIVE_SPEAKER':
      return { ...state, activeSpeakerId: action.payload };
    case 'UPDATE_CHARACTER_STATE':
      return {
        ...state,
        characterStates: state.characterStates.map((cs) =>
          cs.memberId === action.payload.memberId ? action.payload : cs
        ),
      };
    case 'ADD_GUEST_MEMBER':
      return {
        ...state,
        members: [...state.members, action.payload],
        characterStates: [
          ...state.characterStates,
          { memberId: action.payload.id, location: 'boardroom', activity: 'standing' },
        ],
      };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload, status: 'complete' };
    case 'SET_ERROR':
      return { ...state, error: action.payload, status: 'error' };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ===== Context =====
interface DiscussionContextType {
  state: ClientDiscussionState;
  dispatch: Dispatch<DiscussionAction>;
}

const DiscussionContext = createContext<DiscussionContextType>({
  state: initialState,
  dispatch: () => {},
});

export function DiscussionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Memoize to avoid re-creating the context value on every render
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <DiscussionContext.Provider value={value}>
      {children}
    </DiscussionContext.Provider>
  );
}

export const useDiscussionContext = () => useContext(DiscussionContext);
