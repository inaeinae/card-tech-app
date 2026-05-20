import { validateBenefit, normalizeBenefit, type BenefitFormInput } from '@/lib/benefitForm';

function base(): BenefitFormInput {
  return {
    title: '5% 결제일 할인',
    category: '생활',
    discount_pct: 5,
    discount_method: 'bill_discount',
    min_spend_won: null,
    monthly_cap_won: 5000,
    overseas_only: false,
    notes: null,
    targets: [{ group_label: '생활잡화', merchants: '다이소', sort_order: 0 }],
    cap_tiers: [],
  };
}

describe('validateBenefit', () => {
  test('title 필수', () => {
    const errs = validateBenefit({ ...base(), title: '   ' });
    expect(errs.title).toBeTruthy();
  });
  test('discount_pct 범위', () => {
    expect(validateBenefit({ ...base(), discount_pct: -1 }).discount_pct).toBeTruthy();
    expect(validateBenefit({ ...base(), discount_pct: 101 }).discount_pct).toBeTruthy();
    expect(validateBenefit({ ...base(), discount_pct: null }).discount_pct).toBeFalsy();
  });
  test('monthly_cap_won 과 cap_tiers 상호배타', () => {
    const errs = validateBenefit({
      ...base(),
      monthly_cap_won: 5000,
      cap_tiers: [{ min_spend_won: 400000, cap_won: 7000, sort_order: 0 }],
    });
    expect(errs.monthly_cap_won).toBeTruthy();
  });
  test('cap_tiers min_spend 중복 거부', () => {
    const errs = validateBenefit({
      ...base(),
      monthly_cap_won: null,
      cap_tiers: [
        { min_spend_won: 400000, cap_won: 7000, sort_order: 0 },
        { min_spend_won: 400000, cap_won: 10000, sort_order: 1 },
      ],
    });
    expect(errs.cap_tiers).toBeTruthy();
  });
  test('targets group_label/merchants 필수', () => {
    const errs = validateBenefit({
      ...base(),
      targets: [{ group_label: '', merchants: '다이소', sort_order: 0 }],
    });
    expect(errs.targets).toBeTruthy();
  });
});

describe('normalizeBenefit', () => {
  test('cap_tiers min_spend 오름차순 + sort_order 재할당', () => {
    const out = normalizeBenefit({
      ...base(),
      monthly_cap_won: null,
      cap_tiers: [
        { min_spend_won: 1200000, cap_won: 15000, sort_order: 0 },
        { min_spend_won: 400000, cap_won: 7000, sort_order: 1 },
        { min_spend_won: 800000, cap_won: 10000, sort_order: 2 },
      ],
    });
    expect(out.cap_tiers.map((t) => t.min_spend_won)).toEqual([400000, 800000, 1200000]);
    expect(out.cap_tiers.map((t) => t.sort_order)).toEqual([0, 1, 2]);
  });
  test('빈 notes trim → null', () => {
    const out = normalizeBenefit({ ...base(), notes: '  ' });
    expect(out.notes).toBeNull();
  });
});
