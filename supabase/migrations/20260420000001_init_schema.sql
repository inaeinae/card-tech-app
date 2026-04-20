-- Enum 타입
create type public.event_status as enum (
  'registered',
  'applied',
  'in_progress',
  'performance_done',
  'pending_payout',
  'paid',
  'cancelable',
  'canceled'
);

create type public.benefit_type as enum (
  'cashback',
  'discount',
  'payback',
  'other'
);

create type public.notification_kind as enum (
  'apply_deadline',
  'performance_check',
  'payout_upcoming',
  'cancel_available',
  'autopay_check'
);

-- 프로필
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  notify_enabled boolean not null default true,
  notify_time_of_day time not null default '09:00',
  preferred_issuer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 카드
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  issuer text not null,
  name text not null,
  image_path text,
  notes text,
  canceled_at date,
  cancel_scheduled_at date,
  last_event_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_cards_user on public.cards(user_id);
create index idx_cards_issuer_user on public.cards(user_id, issuer);

-- 카드 상시 혜택
create table public.card_benefits (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_card_benefits_card on public.card_benefits(card_id);

-- 이벤트
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete restrict,
  title text not null,
  organizer text,
  apply_start date,
  apply_end date,
  use_start date,
  use_end date,
  payout_expected_at date,
  payout_expected_period text,
  payout_actual_at date,
  cancelable_from date,
  status public.event_status not null default 'registered',
  status_updated_at timestamptz not null default now(),
  notes text,
  warning_dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_events_user on public.events(user_id);
create index idx_events_card on public.events(card_id);
create index idx_events_status on public.events(user_id, status);
create index idx_events_dates on public.events(user_id, use_start, use_end);

-- 상태 이력
create table public.event_status_history (
  id bigserial primary key,
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  from_status public.event_status,
  to_status public.event_status not null,
  is_auto boolean not null default false,
  changed_at timestamptz not null default now(),
  reason text
);
create index idx_history_event on public.event_status_history(event_id, changed_at desc);

-- 이벤트 혜택
create table public.benefits (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id text,
  title text not null,
  type public.benefit_type not null default 'cashback',
  expected_amount numeric(12,0) not null default 0,
  actual_amount numeric(12,0),
  spend_required numeric(12,0),
  spend_actual numeric(12,0),
  conditions jsonb not null default '[]'::jsonb,
  disqualified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_benefits_event on public.benefits(event_id);
create index idx_benefits_user_paid on public.benefits(user_id) where actual_amount is not null;

-- 알림 설정
create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  global_enabled boolean not null default true,
  kinds_enabled jsonb not null default
    '{"apply_deadline":true,"performance_check":true,"payout_upcoming":true,"cancel_available":true,"autopay_check":true}'::jsonb,
  time_of_day time not null default '09:00',
  updated_at timestamptz not null default now()
);

-- 스케줄된 알림 메타
create table public.scheduled_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  kind public.notification_kind not null,
  fire_at timestamptz not null,
  title text not null,
  body text not null,
  delivered_at timestamptz,
  canceled boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_sched_user_fire on public.scheduled_notifications(user_id, fire_at);
create index idx_sched_event on public.scheduled_notifications(event_id);
