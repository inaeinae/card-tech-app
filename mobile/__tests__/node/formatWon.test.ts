import { parseWon, formatWon } from '@/lib/formatWon';

describe('parseWon', () => {
  test('빈 문자열 → null', () => {
    expect(parseWon('')).toBeNull();
    expect(parseWon('   ')).toBeNull();
  });
  test('숫자 + 콤마 + 공백 허용', () => {
    expect(parseWon('40,000')).toBe(40000);
    expect(parseWon(' 1, 200,000 ')).toBe(1200000);
  });
  test('숫자 아님 → null', () => {
    expect(parseWon('abc')).toBeNull();
  });
  test('소수 절삭 (원 단위 정수)', () => {
    expect(parseWon('1000.7')).toBe(1000);
  });
  test('음수 → null (정책: 음수 거부)', () => {
    expect(parseWon('-100')).toBeNull();
  });
});

describe('formatWon', () => {
  test('null → 빈 문자열', () => {
    expect(formatWon(null)).toBe('');
  });
  test('천단위 콤마', () => {
    expect(formatWon(0)).toBe('0');
    expect(formatWon(1000)).toBe('1,000');
    expect(formatWon(1200000)).toBe('1,200,000');
  });
});
