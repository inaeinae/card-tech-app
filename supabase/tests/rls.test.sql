begin;
select plan(6);

-- 두 사용자 생성 (auth.users는 service_role만 insert 가능 → 테스트 세션은 superuser이므로 직접 insert)
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.local');

-- 사용자 A로 가장
set local role authenticated;
set local "request.jwt.claim.sub" to '11111111-1111-1111-1111-111111111111';

-- A가 자기 카드 insert 가능
select lives_ok(
  $$insert into public.cards(user_id, issuer, name) values ('11111111-1111-1111-1111-111111111111','BC','바로ZONE')$$,
  'A can insert own card'
);

-- A가 B 카드 insert 불가
select throws_ok(
  $$insert into public.cards(user_id, issuer, name) values ('22222222-2222-2222-2222-222222222222','BC','B카드')$$,
  '42501',
  null,
  'A cannot insert as B'
);

-- A가 보는 cards 행 수는 1
select results_eq(
  $$select count(*)::int from public.cards$$,
  $$values (1)$$,
  'A sees only own cards'
);

-- B로 전환
set local "request.jwt.claim.sub" to '22222222-2222-2222-2222-222222222222';

-- B는 A 카드 안 보임
select results_eq(
  $$select count(*)::int from public.cards$$,
  $$values (0)$$,
  'B sees zero cards'
);

-- B가 A 카드 update 불가 (UPDATE는 에러 대신 0 row affected)
select is_empty(
  $$update public.cards set notes = 'hacked' where user_id = '11111111-1111-1111-1111-111111111111' returning id$$,
  'B cannot update A rows'
);

-- profiles는 id = auth.uid() 정책
set local "request.jwt.claim.sub" to '11111111-1111-1111-1111-111111111111';
select lives_ok(
  $$insert into public.profiles(id) values ('11111111-1111-1111-1111-111111111111')$$,
  'A can insert own profile'
);

select * from finish();
rollback;
