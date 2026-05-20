// upsertCardBenefit 트랜잭션 시퀀스 검증 — Supabase chain 모킹으로 호출 순서를 캡쳐한다.
type Call = { table: string; op: string; rows?: unknown };

jest.mock('@/lib/supabase', () => {
  const calls: Call[] = [];
  const chain = (table: string) => ({
    // upsert(card_benefits) → select().single() 까지 체이닝
    upsert: (rows: unknown) => {
      calls.push({ table, op: 'upsert', rows });
      return {
        select: () => ({
          single: () =>
            Promise.resolve({
              data: {
                id: 'b1',
                card_id: 'c1',
                user_id: 'u1',
                title: 't',
                category: '생활',
                discount_pct: 5,
                discount_method: 'bill_discount',
                min_spend_won: null,
                monthly_cap_won: null,
                overseas_only: false,
                notes: null,
              },
              error: null,
            }),
        }),
      };
    },
    // delete(targets/cap_tiers) — eq() 으로 종결. 호출 순서 캡쳐 위해 calls 에 push.
    delete: () => {
      calls.push({ table, op: 'delete' });
      return { eq: () => Promise.resolve({ error: null }) };
    },
    // insert(targets/cap_tiers) — 즉시 Promise 반환
    insert: (rows: unknown) => {
      calls.push({ table, op: 'insert', rows });
      return Promise.resolve({ error: null });
    },
    // select(*)→eq()→order() — loadCardBenefits 재조회 흐름
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  });
  return {
    supabase: {
      auth: { getUser: () => Promise.resolve({ data: { user: { id: 'u1' } } }) },
      from: (table: string) => chain(table),
    },
    __calls: calls,
  };
});

// 모킹된 __calls 배열을 any 캐스트로 노출 (TS 가 모듈 추가 export 를 인지하지 못함)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mod = require('@/lib/supabase') as { __calls: Call[] };
const __calls = mod.__calls;

import { useCardStore } from '@/stores/cardStore';

describe('upsertCardBenefit', () => {
  beforeEach(() => {
    __calls.length = 0;
  });

  test('신규: card_benefits upsert → targets insert → cap_tiers insert', async () => {
    const { upsertCardBenefit } = useCardStore.getState();
    await upsertCardBenefit('c1', {
      title: 't',
      category: '생활',
      discount_pct: 5,
      discount_method: 'bill_discount',
      min_spend_won: null,
      monthly_cap_won: null,
      overseas_only: false,
      notes: null,
      targets: [{ group_label: 'g', merchants: 'm', sort_order: 0 }],
      cap_tiers: [{ min_spend_won: 400000, cap_won: 7000, sort_order: 0 }],
    });

    const ops = __calls.map((c) => `${c.op}:${c.table}`);
    expect(ops).toEqual([
      'upsert:card_benefits',
      'insert:card_benefit_targets',
      'insert:card_benefit_cap_tiers',
    ]);
  });

  test('편집: upsert → targets delete → cap_tiers delete → targets insert → cap_tiers insert', async () => {
    const { upsertCardBenefit } = useCardStore.getState();
    await upsertCardBenefit(
      'c1',
      {
        title: 't',
        category: '생활',
        discount_pct: 5,
        discount_method: 'bill_discount',
        min_spend_won: null,
        monthly_cap_won: null,
        overseas_only: false,
        notes: null,
        targets: [{ group_label: 'g', merchants: 'm', sort_order: 0 }],
        cap_tiers: [{ min_spend_won: 400000, cap_won: 7000, sort_order: 0 }],
      },
      'b-existing',
    );

    const ops = __calls.map((c) => `${c.op}:${c.table}`);
    expect(ops).toEqual([
      'upsert:card_benefits',
      'delete:card_benefit_targets',
      'delete:card_benefit_cap_tiers',
      'insert:card_benefit_targets',
      'insert:card_benefit_cap_tiers',
    ]);
  });
});
