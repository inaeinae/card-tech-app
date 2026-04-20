-- 리포트: user_id × 연월 집계 가속 (UTC 기준 월 트렁크)
create index idx_benefits_user_month
  on public.benefits (user_id, (date_trunc('month', created_at at time zone 'UTC')))
  where actual_amount is not null;

-- 캘린더: payout_expected_at 범위 조회
create index idx_events_payout_expected
  on public.events (user_id, payout_expected_at)
  where payout_expected_at is not null;
