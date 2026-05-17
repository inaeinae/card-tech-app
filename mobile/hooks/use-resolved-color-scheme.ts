// 사용자가 마이페이지에서 선택한 mode + OS scheme 을 합쳐 최종 light/dark 결정
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore, type ThemeMode } from '@/stores/themeStore';

export type ResolvedColorScheme = 'light' | 'dark';

export function resolveColorScheme(
  mode: ThemeMode,
  osScheme: 'light' | 'dark' | null | undefined,
): ResolvedColorScheme {
  if (mode === 'light' || mode === 'dark') return mode;
  return osScheme === 'dark' ? 'dark' : 'light';
}

export function useResolvedColorScheme(): ResolvedColorScheme {
  const mode = useThemeStore((s) => s.mode);
  const osScheme = useColorScheme();
  return resolveColorScheme(mode, osScheme ?? null);
}
