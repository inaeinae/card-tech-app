import { Colors } from '@/constants/theme';

// 디자인 토큰 회귀 방지용 스모크 테스트
describe('Colors 토큰', () => {
  it('라이트·다크 모드 각각 필수 키를 노출한다', () => {
    const requiredKeys = [
      'primary',
      'accent',
      'background',
      'surface',
      'foreground',
      'muted',
      'border',
      'destructive',
    ] as const;

    for (const key of requiredKeys) {
      expect(Colors.light[key]).toBeDefined();
      expect(Colors.dark[key]).toBeDefined();
    }
  });

  it('라이트 기본 컬러가 MASTER.md 와 일치한다', () => {
    expect(Colors.light.primary).toBe('#1E40AF');
    expect(Colors.light.accent).toBe('#059669');
    expect(Colors.light.background).toBe('#FFFFFF');
  });

  it('다크 기본 컬러가 MASTER.md 와 일치한다', () => {
    expect(Colors.dark.primary).toBe('#3B82F6');
    expect(Colors.dark.accent).toBe('#10B981');
    expect(Colors.dark.background).toBe('#0F172A');
  });
});
