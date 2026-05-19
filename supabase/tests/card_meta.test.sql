begin;
select plan(7);

-- cards.user_id 는 auth.users(id) FK 이므로 테스트용 사용자 1명을 먼저 생성
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'cardmeta@test.local');

select has_column('public', 'cards', 'card_type', 'cards.card_type 존재');
select has_column('public', 'cards', 'annual_fee_won', 'cards.annual_fee_won 존재');
select has_column('public', 'cards', 'base_min_spend_won', 'cards.base_min_spend_won 존재');

-- card_type CHECK
select throws_ok(
  $$insert into public.cards(user_id, issuer, name, card_type) values ('00000000-0000-0000-0000-000000000001'::uuid, 'X', 'Y', 'invalid')$$,
  '23514',
  null,
  'card_type CHECK 위반'
);

select throws_ok(
  $$insert into public.cards(user_id, issuer, name, annual_fee_won) values ('00000000-0000-0000-0000-000000000001'::uuid, 'X', 'Y', -1)$$,
  '23514',
  null,
  'annual_fee_won 음수 거부'
);

select throws_ok(
  $$insert into public.cards(user_id, issuer, name, base_min_spend_won) values ('00000000-0000-0000-0000-000000000001'::uuid, 'X', 'Y', -1)$$,
  '23514',
  null,
  'base_min_spend_won 음수 거부'
);

prepare ok_row as
  insert into public.cards(user_id, issuer, name, card_type, annual_fee_won, base_min_spend_won)
  values ('00000000-0000-0000-0000-000000000001'::uuid, 'X', 'Y', 'domestic', 10000, 400000)
  returning 1;
select lives_ok('execute ok_row', '정상 row insert');

select * from finish();
rollback;
