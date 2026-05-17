import { resolveColorScheme } from '@/hooks/use-resolved-color-scheme';

describe('resolveColorScheme', () => {
  it('mode=light 면 light 반환 (OS 무관)', () => {
    expect(resolveColorScheme('light', 'dark')).toBe('light');
    expect(resolveColorScheme('light', null)).toBe('light');
  });

  it('mode=dark 면 dark 반환 (OS 무관)', () => {
    expect(resolveColorScheme('dark', 'light')).toBe('dark');
  });

  it('mode=system 이면 OS scheme 사용, null 이면 light fallback', () => {
    expect(resolveColorScheme('system', 'dark')).toBe('dark');
    expect(resolveColorScheme('system', 'light')).toBe('light');
    expect(resolveColorScheme('system', null)).toBe('light');
  });
});
