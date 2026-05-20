begin;
select plan(15);

-- FK 충족용 사전 데이터: auth.users → cards → card_benefits
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000010', 'benefitnorm@test.local');

insert into public.cards (id, user_id, issuer, name) values
  ('00000000-0000-0000-0000-0000000000a1'::uuid,
   '00000000-0000-0000-0000-000000000010'::uuid,
   'X', 'Y');

insert into public.card_benefits (id, card_id, user_id, title) values
  ('00000000-0000-0000-0000-0000000000b1'::uuid,
   '00000000-0000-0000-0000-0000000000a1'::uuid,
   '00000000-0000-0000-0000-000000000010'::uuid,
   '테스트 혜택');

-- 1) card_benefits 신규 컬럼 7개 (has_column)
select has_column('public', 'card_benefits', 'category',        'card_benefits.category 존재');
select has_column('public', 'card_benefits', 'discount_pct',    'card_benefits.discount_pct 존재');
select has_column('public', 'card_benefits', 'discount_method', 'card_benefits.discount_method 존재');
select has_column('public', 'card_benefits', 'min_spend_won',   'card_benefits.min_spend_won 존재');
select has_column('public', 'card_benefits', 'monthly_cap_won', 'card_benefits.monthly_cap_won 존재');
select has_column('public', 'card_benefits', 'overseas_only',   'card_benefits.overseas_only 존재');
select has_column('public', 'card_benefits', 'notes',           'card_benefits.notes 존재');

-- 2) discount_method CHECK 위반
select throws_ok(
  $$insert into public.card_benefits(card_id, user_id, title, discount_method)
    values ('00000000-0000-0000-0000-0000000000a1'::uuid,
            '00000000-0000-0000-0000-000000000010'::uuid,
            'bad', 'invalid_method')$$,
  '23514',
  null,
  'discount_method CHECK 위반'
);

-- 3) discount_pct 범위 위반 (> 100)
select throws_ok(
  $$insert into public.card_benefits(card_id, user_id, title, discount_pct)
    values ('00000000-0000-0000-0000-0000000000a1'::uuid,
            '00000000-0000-0000-0000-000000000010'::uuid,
            'bad', 150)$$,
  '23514',
  null,
  'discount_pct > 100 거부'
);

-- 4) 신규 테이블 2개 존재
select has_table('public', 'card_benefit_targets',   'card_benefit_targets 테이블 존재');
select has_table('public', 'card_benefit_cap_tiers', 'card_benefit_cap_tiers 테이블 존재');

-- 5) FK: benefit_id → card_benefits.id
select fk_ok(
  'public', 'card_benefit_targets',   'benefit_id',
  'public', 'card_benefits',          'id'
);
select fk_ok(
  'public', 'card_benefit_cap_tiers', 'benefit_id',
  'public', 'card_benefits',          'id'
);

-- 6) UNIQUE (benefit_id, min_spend_won) on cap_tiers
select col_is_unique(
  'public', 'card_benefit_cap_tiers',
  ARRAY['benefit_id', 'min_spend_won'],
  'cap_tiers (benefit_id, min_spend_won) UNIQUE'
);

-- 7) targets 인덱스
select has_index(
  'public', 'card_benefit_targets', 'idx_benefit_targets_benefit',
  'idx_benefit_targets_benefit 인덱스 존재'
);

select * from finish();
rollback;
