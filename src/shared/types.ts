// ===== Domain =====
export interface Domain {
  id: string;
  name: string;
  nameHe: string;
  icon: string;
  description: string;
  color: string;
  exampleTopics: string[];
}

// ===== Council =====
export type CouncilMode = 'experts' | 'csuite';
export type DiscussionLanguage = 'he' | 'en' | 'ar' | 'ru' | 'fr' | 'es';

export const LANGUAGES: { id: DiscussionLanguage; label: string; flag: string }[] = [
  { id: 'he', label: 'עברית', flag: '🇮🇱' },
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'ar', label: 'العربية', flag: '🇸🇦' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
];

export interface CouncilMember {
  id: string;
  name: string;
  nickname?: string;
  role: string;
  title: string;
  domainTitle: string;
  background: string;
  yearsExperience: number;
  expertise: string[];
  personality: string;
  color: string;
  avatarAccessory: string;
  isGuest?: boolean;
  invitedBy?: string;
}

// ===== Discussion Phases =====
export type DiscussionPhase =
  | 'opening'
  | 'probing'
  | 'research'
  | 'challenge'
  | 'guest'
  | 'consensus'
  | 'closing';

export const DISCUSSION_PHASES: { id: DiscussionPhase; label: string; labelHe: string; description: string }[] = [
  { id: 'opening', label: 'Opening Statements', labelHe: 'פתיחה', description: 'Initial analysis from each perspective' },
  { id: 'probing', label: 'Deep Probing', labelHe: 'חקירה', description: 'Experts question each other deeply' },
  { id: 'research', label: 'Research & Evidence', labelHe: 'מחקר', description: 'Data, case studies, market analysis' },
  { id: 'challenge', label: 'Challenge & Debate', labelHe: 'עימות', description: "Devil's advocate, real disagreements" },
  { id: 'guest', label: 'Guest Expert', labelHe: 'מומחה אורח', description: 'Field expert joins the discussion' },
  { id: 'consensus', label: 'Consensus Building', labelHe: 'הסכמה', description: "What we agree on, what we don't" },
  { id: 'closing', label: 'Final Recommendations', labelHe: 'סיכום', description: 'One recommendation each + synthesis' },
];

// ===== Messages =====
export interface DiscussionMessage {
  id: string;
  memberId: string;
  phase: DiscussionPhase;
  content: string;
  timestamp: number;
  referencedMessageIds?: string[];
  type: 'speech' | 'side-chat' | 'moderator' | 'research-result' | 'guest-intro';
}

// ===== Character State =====
export type CharacterLocation = 'boardroom' | 'whiteboard' | 'coffee' | 'dev-room' | 'walking';

export interface CharacterState {
  memberId: string;
  location: CharacterLocation;
  activity: 'sitting' | 'standing' | 'walking' | 'writing' | 'drinking' | 'thinking' | 'speaking';
  targetLocation?: CharacterLocation;
}

// ===== Discussion State =====
export interface DiscussionState {
  id: string;
  domain: Domain;
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
}

// ===== SSE =====
export type SSEEventType =
  | 'phase-change'
  | 'member-start'
  | 'token'
  | 'member-end'
  | 'character-move'
  | 'guest-join'
  | 'research-result'
  | 'side-chat'
  | 'break-start'
  | 'break-end'
  | 'discussion-complete'
  | 'error';

export interface SSEEvent {
  type: SSEEventType;
  data: Record<string, unknown>;
}

// ===== Summary =====
export interface DiscussionSummary {
  executiveSummary: string;
  keyTension: string;
  consensus: string[];
  dissent: string[];
  openQuestion: string;
  memberRecommendations: MemberRecommendation[];
  actionItems: ActionItem[];
  risks: RiskItem[];
  opportunities: OpportunityItem[];
}

export interface MemberRecommendation {
  memberId: string;
  recommendation: string;
  doThis: string;
  avoidThis: string;
}

export interface ActionItem {
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  timeframe: string;
  agent?: string;
}

export interface RiskItem {
  risk: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  probability: 'high' | 'medium' | 'low';
  mitigation: string;
  flaggedBy: string[];
}

export interface OpportunityItem {
  opportunity: string;
  potential: 'high' | 'medium' | 'low';
  description: string;
  flaggedBy: string[];
}

// ===== Execution Plan =====
export interface ExecutionPlan {
  milestones: Milestone[];
  team: TeamRole[];
  budget: BudgetItem[];
  risks: RiskItem[];
  timeline: TimelinePhase[];
  successCriteria: string[];
  dependencies: Dependency[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  phase: string;
  estimatedWeeks: number;
  deliverables: string[];
  status: 'pending' | 'in-progress' | 'done';
  agents?: string[];
}

export interface TeamRole {
  role: string;
  why: string;
  joinAtMilestone: string;
  type: 'full-time' | 'part-time' | 'consultant';
  skills: string[];
  quotedFrom?: string;
}

export interface BudgetItem {
  category: string;
  phase: string;
  optimistic: number;
  realistic: number;
  pessimistic: number;
  notes: string;
}

export interface TimelinePhase {
  name: string;
  color: string;
  startWeek: number;
  endWeek: number;
  milestoneIds: string[];
}

export interface Dependency {
  from: string;
  to: string;
  type: 'blocks' | 'informs';
}

// ===== API =====
export interface StartDiscussionRequest {
  domain: Domain;
  idea: string;
  mode: CouncilMode;
  language?: DiscussionLanguage;
}

export interface UserInteraction {
  type: 'question' | 'info' | 'challenge' | 'research' | 'invite-guest' | 'another-round' | 'pause' | 'summarize';
  targetMemberId?: string;
  content: string;
}
