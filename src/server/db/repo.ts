import { getSql } from './neon';
import { encryptIdea, hashIdea } from '../lib/crypto';

export type UserRow = {
  id: string;
  email: string;
  plan: 'free' | 'paid';
  monthly_usage_count: number;
  monthly_usage_reset_at: string;
  subscription_id: string | null;
  current_period_end: string | null;
};

export async function upsertUser(userId: string, email: string): Promise<UserRow> {
  const sql = getSql();
  const rows = (await sql`
    insert into users (id, email, last_seen_at)
    values (${userId}, ${email}, now())
    on conflict (id) do update
      set email = excluded.email,
          last_seen_at = now()
    returning id, email, plan, monthly_usage_count, monthly_usage_reset_at,
              subscription_id, current_period_end
  `) as UserRow[];
  return rows[0];
}

export async function getUser(userId: string): Promise<UserRow | null> {
  const sql = getSql();
  const rows = (await sql`
    select id, email, plan, monthly_usage_count, monthly_usage_reset_at,
           subscription_id, current_period_end
    from users where id = ${userId}
  `) as UserRow[];
  return rows[0] ?? null;
}

export async function resetMonthlyUsageIfDue(userId: string): Promise<void> {
  const sql = getSql();
  await sql`
    update users
    set monthly_usage_count = 0,
        monthly_usage_reset_at = date_trunc('month', now()) + interval '1 month'
    where id = ${userId}
      and monthly_usage_reset_at <= now()
  `;
}

export async function incrementUsage(userId: string): Promise<void> {
  const sql = getSql();
  await sql`
    update users
    set monthly_usage_count = monthly_usage_count + 1
    where id = ${userId}
  `;
}

export type DiscussionInsert = {
  id: string;
  userId: string;
  domain: string;
  mode: string;
  language: string;
  idea: string;
};

export async function insertDiscussion(input: DiscussionInsert): Promise<void> {
  const sql = getSql();
  const encrypted = encryptIdea(input.idea);
  const hash = hashIdea(input.idea);
  await sql`
    insert into discussions (id, user_id, domain, mode, language, encrypted_idea, idea_hash)
    values (${input.id}, ${input.userId}, ${input.domain}, ${input.mode},
            ${input.language}, ${encrypted}, ${hash})
  `;
}

export async function updateDiscussionStatus(
  discussionId: string,
  status: 'complete' | 'abandoned' | 'error',
  totals?: { messages?: number; tokens?: number; costUsd?: number },
): Promise<void> {
  const sql = getSql();
  const completedAt = status === 'complete' ? new Date().toISOString() : null;
  await sql`
    update discussions
    set status = ${status},
        completed_at = coalesce(${completedAt}::timestamptz, completed_at),
        total_messages = coalesce(${totals?.messages ?? null}, total_messages),
        total_tokens = coalesce(${totals?.tokens ?? null}, total_tokens),
        estimated_cost_usd = coalesce(${totals?.costUsd ?? null}, estimated_cost_usd)
    where id = ${discussionId}
  `;
}

export async function logDiscussionEvent(
  discussionId: string,
  eventType: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const sql = getSql();
  await sql`
    insert into discussion_events (discussion_id, event_type, payload)
    values (${discussionId}, ${eventType}, ${JSON.stringify(payload)}::jsonb)
  `;
}

export type GeminiUsageInsert = {
  discussionId: string | null;
  userId: string | null;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  latencyMs: number;
};

export async function logGeminiUsage(input: GeminiUsageInsert): Promise<void> {
  const sql = getSql();
  await sql`
    insert into gemini_usage
      (discussion_id, user_id, model, prompt_tokens, completion_tokens,
       total_tokens, cost_usd, latency_ms)
    values
      (${input.discussionId}, ${input.userId}, ${input.model},
       ${input.promptTokens}, ${input.completionTokens}, ${input.totalTokens},
       ${input.costUsd}, ${input.latencyMs})
  `;
}

export type DiscussionHistoryRow = {
  id: string;
  domain: string;
  mode: string;
  language: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  total_messages: number;
  estimated_cost_usd: string;
};

export async function listDiscussionsForUser(
  userId: string,
  limit = 50,
): Promise<DiscussionHistoryRow[]> {
  const sql = getSql();
  return (await sql`
    select id, domain, mode, language, status, started_at, completed_at,
           total_messages, estimated_cost_usd
    from discussions
    where user_id = ${userId}
    order by started_at desc
    limit ${limit}
  `) as DiscussionHistoryRow[];
}

// ---------- Admin queries ----------

export async function getOverviewMetrics(): Promise<{
  dau: number;
  wau: number;
  mau: number;
  total_discussions: number;
  completed_discussions: number;
  total_users: number;
  paid_users: number;
  today_cost_usd: number;
  month_cost_usd: number;
}> {
  const sql = getSql();
  const rows = (await sql`
    select
      (select count(distinct user_id) from discussions where started_at > now() - interval '1 day')::int as dau,
      (select count(distinct user_id) from discussions where started_at > now() - interval '7 days')::int as wau,
      (select count(distinct user_id) from discussions where started_at > now() - interval '30 days')::int as mau,
      (select count(*) from discussions)::int as total_discussions,
      (select count(*) from discussions where status = 'complete')::int as completed_discussions,
      (select count(*) from users)::int as total_users,
      (select count(*) from users where plan = 'paid')::int as paid_users,
      coalesce((select sum(cost_usd) from gemini_usage where created_at > now() - interval '1 day'), 0)::float as today_cost_usd,
      coalesce((select sum(cost_usd) from gemini_usage where created_at > now() - interval '30 days'), 0)::float as month_cost_usd
  `) as any[];
  return rows[0];
}

export type AdminDiscussionRow = {
  id: string;
  user_id: string;
  user_email: string;
  domain: string;
  mode: string;
  language: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  total_messages: number;
  total_tokens: number;
  estimated_cost_usd: string;
};

export async function listAllDiscussions(limit = 100): Promise<AdminDiscussionRow[]> {
  const sql = getSql();
  return (await sql`
    select d.id, d.user_id, u.email as user_email, d.domain, d.mode, d.language,
           d.status, d.started_at, d.completed_at, d.total_messages, d.total_tokens,
           d.estimated_cost_usd
    from discussions d
    join users u on u.id = d.user_id
    order by d.started_at desc
    limit ${limit}
  `) as AdminDiscussionRow[];
}

export async function getEncryptedIdea(discussionId: string): Promise<string | null> {
  const sql = getSql();
  const rows = (await sql`
    select encrypted_idea from discussions where id = ${discussionId}
  `) as { encrypted_idea: string }[];
  return rows[0]?.encrypted_idea ?? null;
}

export type AdminUserRow = {
  id: string;
  email: string;
  created_at: string;
  last_seen_at: string | null;
  plan: string;
  monthly_usage_count: number;
  total_discussions: number;
  total_cost_usd: string;
};

export async function listAllUsers(limit = 200): Promise<AdminUserRow[]> {
  const sql = getSql();
  return (await sql`
    select u.id, u.email, u.created_at, u.last_seen_at, u.plan,
           u.monthly_usage_count,
           (select count(*) from discussions d where d.user_id = u.id)::int as total_discussions,
           coalesce((select sum(cost_usd) from gemini_usage g where g.user_id = u.id), 0)::text as total_cost_usd
    from users u
    order by u.last_seen_at desc nulls last
    limit ${limit}
  `) as AdminUserRow[];
}

export type DailyCostRow = { day: string; cost_usd: string; calls: number };

export async function listDailyCosts(days = 30): Promise<DailyCostRow[]> {
  const sql = getSql();
  return (await sql`
    select date_trunc('day', created_at)::date::text as day,
           coalesce(sum(cost_usd), 0)::text as cost_usd,
           count(*)::int as calls
    from gemini_usage
    where created_at > now() - (${days}::int || ' days')::interval
    group by day
    order by day asc
  `) as DailyCostRow[];
}

export async function logAdminAction(
  adminUserId: string,
  action: string,
  targetId: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const sql = getSql();
  await sql`
    insert into admin_audit_log (admin_user_id, action, target_id, metadata)
    values (${adminUserId}, ${action}, ${targetId}, ${JSON.stringify(metadata)}::jsonb)
  `;
}
