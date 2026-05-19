begin;
select plan(8);

-- 두 사용자 + 카드/혜택 사전 데이터 (FK 충족)
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.local');

insert into public.cards (id, user_id, issuer, name) values
  ('00000000-0000-0000-0000-0000000000a1'::uuid,
   '11111111-1111-1111-1111-111111111111'::uuid,
   'X', 'A카드');

insert into public.card_benefits (id, card_id, user_id, title) values
  ('00000000-0000-0000-0000-0000000000b1'::uuid,
   '00000000-0000-0000-0000-0000000000a1'::uuid,
   '11111111-1111-1111-1111-111111111111'::uuid,
   '테스트 혜택');

-- 1) RLS 활성화 확인 — card_benefit_targets
select is(
  (select relrowsecurity from pg_class where oid = 'public.card_benefit_targets'::regclass),
  true,
  'card_benefit_targets RLS 활성화됨'
);

-- 2) RLS 활성화 확인 — card_benefit_cap_tiers
select is(
  (select relrowsecurity from pg_class where oid = 'public.card_benefit_cap_tiers'::regclass),
  true,
  'card_benefit_cap_tiers RLS 활성화됨'
);

-- 3) policies_are — card_benefit_targets 4정책
select policies_are(
  'public', 'card_benefit_targets',
  array['own_rows_select', 'own_rows_insert', 'own_rows_update', 'own_rows_delete'],
  'card_benefit_targets own_rows_* 4정책 존재'
);

-- 4) policies_are — card_benefit_cap_tiers 4정책
select policies_are(
  'public', 'card_benefit_cap_tiers',
  array['own_rows_select', 'own_rows_insert', 'own_rows_update', 'own_rows_delete'],
  'card_benefit_cap_tiers own_rows_* 4정책 존재'
);

-- 사용자 A로 가장
set local role authenticated;
set local "request.jwt.claim.sub" to '11111111-1111-1111-1111-111111111111';

-- 5) A가 자기 user_id로 targets insert 가능
select lives_ok(
  $$insert into public.card_benefit_targets(benefit_id, user_id, group_label, merchants)
    values ('00000000-0000-0000-0000-0000000000b1'::uuid,
            '11111111-1111-1111-1111-111111111111'::uuid,
            '편의점', 'CU/GS25')$$,
  'A는 자기 user_id로 card_benefit_targets insert 가능'
);

-- 6) A가 B user_id로 targets insert 불가 (42501)
select throws_ok(
  $$insert into public.card_benefit_targets(benefit_id, user_id, group_label, merchants)
    values ('00000000-0000-0000-0000-0000000000b1'::uuid,
            '22222222-2222-2222-2222-222222222222'::uuid,
            '편의점', 'CU/GS25')$$,
  '42501',
  null,
  'A는 B user_id로 card_benefit_targets insert 불가'
);

-- 7) A가 자기 user_id로 cap_tiers insert 가능
select lives_ok(
  $$insert into public.card_benefit_cap_tiers(benefit_id, user_id, min_spend_won, cap_won)
    values ('00000000-0000-0000-0000-0000000000b1'::uuid,
            '11111111-1111-1111-1111-111111111111'::uuid,
            300000, 10000)$$,
  'A는 자기 user_id로 card_benefit_cap_tiers insert 가능'
);

-- 8) A가 B user_id로 cap_tiers insert 불가 (42501)
select throws_ok(
  $$insert into public.card_benefit_cap_tiers(benefit_id, user_id, min_spend_won, cap_won)
    values ('00000000-0000-0000-0000-0000000000b1'::uuid,
            '22222222-2222-2222-2222-222222222222'::uuid,
            500000, 20000)$$,
  '42501',
  null,
  'A는 B user_id로 card_benefit_cap_tiers insert 불가'
);

select * from finish();
rollback;
