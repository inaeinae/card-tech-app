-- Phase 5.3 — card_benefits 정규화 + 대상/한도 구간 테이블

-- 1) card_benefits 신규 컬럼
alter table public.card_benefits
  add column category text,
  add column discount_pct numeric(5,2) check (discount_pct >= 0 and discount_pct <= 100),
  add column discount_method text check (discount_method in ('bill_discount','instant_discount','cashback','point','other')),
  add column min_spend_won integer check (min_spend_won >= 0),
  add column monthly_cap_won integer check (monthly_cap_won >= 0),
  add column overseas_only boolean not null default false,
  add column notes text;

comment on column public.card_benefits.category is '혜택 카테고리 라벨 (자유 텍스트, 프리셋 권장)';
comment on column public.card_benefits.discount_pct is '할인/적립률 % (0-100)';
comment on column public.card_benefits.discount_method is 'bill_discount/instant_discount/cashback/point/other';
comment on column public.card_benefits.min_spend_won is '혜택 단위 전월실적 임계값 (없으면 null)';
comment on column public.card_benefits.monthly_cap_won is '단일 월 한도. 구간이 있으면 null';
comment on column public.card_benefits.overseas_only is '해외겸용 카드 한정 혜택';

-- 2) 대상 구분 · 가맹점
create table public.card_benefit_targets (
  id uuid primary key default gen_random_uuid(),
  benefit_id uuid not null references public.card_benefits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  group_label text not null,
  merchants text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index idx_benefit_targets_benefit on public.card_benefit_targets(benefit_id);

-- 3) 전월실적 구간별 한도
create table public.card_benefit_cap_tiers (
  id uuid primary key default gen_random_uuid(),
  benefit_id uuid not null references public.card_benefits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  min_spend_won integer not null check (min_spend_won >= 0),
  cap_won integer not null check (cap_won >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (benefit_id, min_spend_won)
);
create index idx_benefit_cap_tiers_benefit on public.card_benefit_cap_tiers(benefit_id);
