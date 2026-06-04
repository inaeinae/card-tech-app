begin;
select plan(2);

-- Phase 5.3 v1.1 — card_benefits.details(jsonb) 제거 검증
-- 정규화(20260520000002) 이후 미사용 잔재 컬럼 drop

-- 1) details 컬럼이 더 이상 존재하지 않아야 함
select hasnt_column('public', 'card_benefits', 'details', 'card_benefits.details 제거됨');

-- 2) details 없이도 혜택 insert 정상 동작 (FK 사전 데이터 포함)
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000020', 'dropdetails@test.local');
insert into public.cards (id, user_id, issuer, name) values
  ('00000000-0000-0000-0000-0000000000c1'::uuid,
   '00000000-0000-0000-0000-000000000020'::uuid,
   'X', 'Y');

select lives_ok(
  $$insert into public.card_benefits (card_id, user_id, title)
    values ('00000000-0000-0000-0000-0000000000c1'::uuid,
            '00000000-0000-0000-0000-000000000020'::uuid,
            '상시 혜택')$$,
  'details 컬럼 없이 card_benefits insert 정상'
);

select * from finish();
rollback;
