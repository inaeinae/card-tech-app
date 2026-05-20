import { validateCardForm, normalizeCardForm } from '@/lib/cardForm';

describe('validateCardForm', () => {
  it('issuer/name 채워지면 에러 없음', () => {
    const errors = validateCardForm({
      issuer: '비씨카드',
      name: '바로 ZONE',
      notes: null,
      card_type: 'domestic',
      annual_fee_won: null,
      base_min_spend_won: null,
    });
    expect(errors).toEqual({});
  });

  it('issuer 빈 문자열/공백은 에러', () => {
    expect(
      validateCardForm({
        issuer: '',
        name: 'x',
        notes: null,
        card_type: 'domestic',
        annual_fee_won: null,
        base_min_spend_won: null,
      }).issuer,
    ).toMatch(/필수/);
    expect(
      validateCardForm({
        issuer: '   ',
        name: 'x',
        notes: null,
        card_type: 'domestic',
        annual_fee_won: null,
        base_min_spend_won: null,
      }).issuer,
    ).toMatch(/필수/);
  });

  it('name 32자 초과는 에러', () => {
    const long = 'x'.repeat(33);
    expect(
      validateCardForm({
        issuer: 'a',
        name: long,
        notes: null,
        card_type: 'domestic',
        annual_fee_won: null,
        base_min_spend_won: null,
      }).name,
    ).toMatch(/32/);
  });
});

describe('normalizeCardForm', () => {
  it('앞뒤 공백 trim, notes 빈 문자열은 null', () => {
    const n = normalizeCardForm({
      issuer: ' 비씨 ',
      name: ' 바로 ',
      notes: '  ',
      card_type: 'domestic',
      annual_fee_won: null,
      base_min_spend_won: null,
    });
    expect(n).toEqual({
      issuer: '비씨',
      name: '바로',
      notes: null,
      card_type: 'domestic',
      annual_fee_won: null,
      base_min_spend_won: null,
    });
  });
});

describe('Phase 5.3 — 카드 메타', () => {
  test('card_type 필수', () => {
    const errs = validateCardForm({
      issuer: 'X',
      name: 'Y',
      notes: null,
      card_type: null,
      annual_fee_won: null,
      base_min_spend_won: null,
    });
    expect(errs.card_type).toBeTruthy();
  });
  test('annual_fee_won 음수 거부', () => {
    const errs = validateCardForm({
      issuer: 'X',
      name: 'Y',
      notes: null,
      card_type: 'domestic',
      annual_fee_won: -1,
      base_min_spend_won: null,
    });
    expect(errs.annual_fee_won).toBeTruthy();
  });
  test('base_min_spend_won 음수 거부', () => {
    const errs = validateCardForm({
      issuer: 'X',
      name: 'Y',
      notes: null,
      card_type: 'domestic',
      annual_fee_won: 0,
      base_min_spend_won: -100,
    });
    expect(errs.base_min_spend_won).toBeTruthy();
  });
  test('정상값 normalize', () => {
    const out = normalizeCardForm({
      issuer: ' X ',
      name: 'Y',
      notes: ' ',
      card_type: 'overseas',
      annual_fee_won: 10000,
      base_min_spend_won: 400000,
    });
    expect(out.notes).toBeNull();
    expect(out.card_type).toBe('overseas');
    expect(out.annual_fee_won).toBe(10000);
  });
});
