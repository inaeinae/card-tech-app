// 다크모드 토글 — OS 연동 기본, 수동 override 는 앱 수준 상태로 관리 (Phase 12 에서 persisted)
// v1 MVP: colorScheme 출력만 스위치 (미래 확장용 훅)
import { Pressable, Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemeToggleProps = {
  onPress?: () => void;
};

export function ThemeToggle({ onPress }: ThemeToggleProps) {
  const scheme = useColorScheme();
  const label = scheme === 'dark' ? '다크모드' : '라이트모드';

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="다크모드 토글"
      accessibilityState={{ checked: scheme === 'dark' }}
      hitSlop={10}
      onPress={onPress}
      className="flex-row items-center gap-2 rounded-md border border-border dark:border-border-dark px-4 py-2"
    >
      <Text className="text-label text-foreground dark:text-foreground-dark">{label}</Text>
    </Pressable>
  );
}
