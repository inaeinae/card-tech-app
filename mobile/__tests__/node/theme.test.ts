import { Colors } from '@/constants/theme';

describe('Colors 토큰', () => {
  it('라이트·다크 모드 각각 필수 키를 노출한다', () => {
    const requiredKeys = [
      'primary',
      'accent',
      'bg',
      'surface',
      'ink',
      'border',
      'danger',
    ] as const;

    for (const key of requiredKeys) {
      expect(Colors.light[key]).toBeDefined();
      expect(Colors.dark[key]).toBeDefined();
    }
  });

  it('primary 토큰이 Pencil 스펙(#3182F6)과 일치한다', () => {
    expect(Colors.light.primary).toBe('#3182F6');
  });
  it('accent 토큰이 Pencil 스펙(#19D294)과 일치한다', () => {
    expect(Colors.light.accent).toBe('#19D294');
  });
  it('ink 토큰이 Pencil 스펙(#191F28)과 일치한다', () => {
    expect(Colors.light.ink).toBe('#191F28');
  });

  it('다크 기본 컬러 확인', () => {
    expect(Colors.dark.primary).toBe('#3B82F6');
    expect(Colors.dark.accent).toBe('#10B981');
    expect(Colors.dark.background).toBe('#0F172A');
  });
});
