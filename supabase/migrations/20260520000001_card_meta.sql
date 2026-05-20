-- Phase 5.3 — cards 메타: 카드 종류 / 연회비 / 카드 단위 전월실적
alter table public.cards
  add column card_type text check (card_type in ('domestic','overseas')),
  add column annual_fee_won integer check (annual_fee_won >= 0),
  add column base_min_spend_won integer check (base_min_spend_won >= 0);

comment on column public.cards.card_type is '발급한 카드 종류. domestic=국내전용, overseas=해외겸용';
comment on column public.cards.annual_fee_won is '선택한 카드 종류 기준 연회비 (원)';
comment on column public.cards.base_min_spend_won is '카드의 기본 혜택을 받기 위한 전월 결제 최소금액 메모 (원)';
