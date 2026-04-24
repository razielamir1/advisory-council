import posthog from 'posthog-js';

type AnalyticsEvents = {
  landing_view: { language?: string; referrer?: string };
  start_flow_begin: { time_since_landing_ms?: number };
  domain_selected: { domain_id: string; mode: string };
  language_selected: { language: string };
  idea_submitted: {
    idea_length: number;
    has_url: boolean;
    mode: string;
    domain: string;
    language: string;
  };
  website_analyzed: { url_domain_hash: string };
  discussion_started: { discussion_id: string };
  member_interaction: {
    member_role: string;
    message_type: 'question' | 'challenge' | 'info' | 'other';
  };
  phase_transition: { from_phase: string; to_phase: string; duration_ms?: number };
  discussion_abandoned: { last_phase: string; time_spent_ms: number };
  discussion_completed: { total_duration_ms: number; messages_count: number };
  summary_copied: Record<string, never>;
  execution_plan_generated: Record<string, never>;
  launchpad_opened: Record<string, never>;
  kanban_task_moved: { from_column: string; to_column: string };
  export_downloaded: { format: 'md' | 'pdf' | 'csv' };
  paywall_hit: { current_usage: number; limit: number };
  upgrade_clicked: { plan_id: string };
};

type EventName = keyof AnalyticsEvents;

let initialized = false;

export function initAnalytics(): void {
  if (initialized) return;

  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com';

  if (!key) {
    if (import.meta.env.DEV) {
      console.info('[analytics] VITE_POSTHOG_KEY missing - analytics disabled');
    }
    return;
  }

  posthog.init(key, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: 'history_change',
    session_recording: {
      maskAllInputs: true,
    },
    autocapture: false,
  });

  initialized = true;
}

export function track<E extends EventName>(
  event: E,
  properties?: AnalyticsEvents[E],
): void {
  if (!initialized) return;
  posthog.capture(event, properties as Record<string, unknown> | undefined);
}

export function identify(userId: string, traits?: Record<string, unknown>): void {
  if (!initialized) return;
  posthog.identify(userId, traits);
}

export function resetAnalytics(): void {
  if (!initialized) return;
  posthog.reset();
}

export async function hashString(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}
