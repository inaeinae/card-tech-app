// tailwind.config.js 의 colors hex 와 constants/theme.ts 의 Colors 가 일치하는지 검증.
// Pencil 변수와 1:1 매칭 보장.
import tailwindConfig from '../../tailwind.config.js';
import { Colors } from '../../constants/theme';

const colors = (
  tailwindConfig as {
    theme: { extend: { colors: Record<string, Record<string, string>> } };
  }
).theme.extend.colors;

describe('tailwind.config.js ↔ constants/theme.ts 토큰 일치', () => {
  test('primary', () => {
    expect(colors.primary.DEFAULT).toBe(Colors.light.primary);
    expect(colors.primary.dark).toBe(Colors.dark.primary);
  });
  test('bg / surface / surface-2', () => {
    expect(colors.bg.DEFAULT).toBe(Colors.light.bg);
    expect(colors.surface.DEFAULT).toBe(Colors.light.surface);
    expect(colors['surface-2'].DEFAULT).toBe(Colors.light.surface2);
  });
  test('ink 4단계', () => {
    expect(colors.ink.DEFAULT).toBe(Colors.light.ink);
    expect(colors['ink-2'].DEFAULT).toBe(Colors.light.ink2);
    expect(colors['ink-3'].DEFAULT).toBe(Colors.light.ink3);
    expect(colors['ink-4'].DEFAULT).toBe(Colors.light.ink4);
  });
  test('border / border-strong', () => {
    expect(colors.border.DEFAULT).toBe(Colors.light.border);
    expect(colors['border-strong'].DEFAULT).toBe(Colors.light.borderStrong);
  });
  test('danger + soft', () => {
    expect(colors.danger.DEFAULT).toBe(Colors.light.danger);
    expect(colors.danger.soft).toBe(Colors.light.dangerSoft);
  });
  test('warning + soft', () => {
    expect(colors.warning.DEFAULT).toBe(Colors.light.warning);
    expect(colors.warning.soft).toBe(Colors.light.warningSoft);
  });
  test('별칭 — background/foreground/muted/destructive', () => {
    expect(colors.background.DEFAULT).toBe(Colors.light.bg);
    expect(colors.foreground.DEFAULT).toBe(Colors.light.ink);
    expect(colors.muted.DEFAULT).toBe(Colors.light.ink3);
    expect(colors.destructive.DEFAULT).toBe(Colors.light.danger);
  });
});
