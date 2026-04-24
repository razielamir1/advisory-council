-- Phase 2: initial schema for advisory-council persistence
-- Auth is handled externally by Clerk. We reference Clerk user IDs as TEXT.
-- All authorization is enforced in the Express middleware, not Postgres RLS.

create extension if not exists "pgcrypto";

create table if not exists users (
  id text primary key,                              -- Clerk user id (sub from JWT)
  email text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  plan text not null default 'free',                -- 'free' | 'paid'
  subscription_id text,
  current_period_end timestamptz,
  billing_provider text,                            -- 'lemonsqueezy' | 'cardcom'
  cardcom_token text,                               -- reserved for phase 4b
  monthly_usage_count integer not null default 0,
  monthly_usage_reset_at timestamptz not null default date_trunc('month', now()) + interval '1 month'
);

create index if not exists users_email_idx on users (email);

create table if not exists discussions (
  id uuid primary key,                              -- matches in-memory discussionId
  user_id text not null references users(id) on delete cascade,
  domain text not null,
  mode text not null,                               -- 'csuite' | 'experts'
  language text not null,                           -- 'he' | 'en' | 'ar' | 'ru' | 'fr' | 'es'
  status text not null default 'active',            -- 'active' | 'complete' | 'abandoned' | 'error'
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  total_messages integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost_usd numeric(10,4) not null default 0,
  encrypted_idea text not null,                     -- base64(iv || ciphertext || authTag)
  idea_hash text not null                           -- sha256 hex
);

create index if not exists discussions_user_id_idx on discussions (user_id);
create index if not exists discussions_started_at_idx on discussions (started_at desc);
create index if not exists discussions_idea_hash_idx on discussions (idea_hash);

create table if not exists discussion_events (
  id bigserial primary key,
  discussion_id uuid not null references discussions(id) on delete cascade,
  event_type text not null,                         -- 'phase_change' | 'interact' | 'error' | 'api_call'
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists discussion_events_discussion_id_idx on discussion_events (discussion_id);
create index if not exists discussion_events_created_at_idx on discussion_events (created_at desc);

create table if not exists gemini_usage (
  id bigserial primary key,
  discussion_id uuid references discussions(id) on delete set null,
  user_id text references users(id) on delete set null,
  model text not null,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  cost_usd numeric(10,6) not null default 0,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists gemini_usage_user_id_idx on gemini_usage (user_id);
create index if not exists gemini_usage_created_at_idx on gemini_usage (created_at desc);

create table if not exists admin_audit_log (
  id bigserial primary key,
  admin_user_id text not null,
  action text not null,                             -- 'decrypt_idea' | 'view_user' | 'export_csv' | ...
  target_id text,                                   -- discussion id, user id, etc.
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_admin_user_id_idx on admin_audit_log (admin_user_id);
create index if not exists admin_audit_log_created_at_idx on admin_audit_log (created_at desc);
