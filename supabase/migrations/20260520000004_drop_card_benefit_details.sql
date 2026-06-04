-- Phase 5.3 v1.1 — card_benefits.details(jsonb) 제거
-- init_schema(20260420000001)에서 추가된 details 컬럼은 정규화(20260520000002)로
-- category/discount_*/min_spend_won/monthly_cap_won/overseas_only/notes + targets/cap_tiers
-- 테이블로 대체됨. 앱 코드에서 읽기·쓰기 모두 미사용 → 잔재 컬럼 제거.

alter table public.card_benefits
  drop column details;
