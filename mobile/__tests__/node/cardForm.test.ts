import { validateCardForm, normalizeCardForm } from '@/lib/cardForm';

describe('validateCardForm', () => {
  it('issuer/name 채워지면 에러 없음', () => {
    const errors = validateCardForm({ issuer: '비씨카드', name: '바로 ZONE', notes: null });
    expect(errors).toEqual({});
  });

  it('issuer 빈 문자열/공백은 에러', () => {
    expect(validateCardForm({ issuer: '', name: 'x', notes: null }).issuer).toMatch(/필수/);
    expect(validateCardForm({ issuer: '   ', name: 'x', notes: null }).issuer).toMatch(/필수/);
  });

  it('name 32자 초과는 에러', () => {
    const long = 'x'.repeat(33);
    expect(validateCardForm({ issuer: 'a', name: long, notes: null }).name).toMatch(/32/);
  });
});

describe('normalizeCardForm', () => {
  it('앞뒤 공백 trim, notes 빈 문자열은 null', () => {
    const n = normalizeCardForm({ issuer: ' 비씨 ', name: ' 바로 ', notes: '  ' });
    expect(n).toEqual({ issuer: '비씨', name: '바로', notes: null });
  });
});
