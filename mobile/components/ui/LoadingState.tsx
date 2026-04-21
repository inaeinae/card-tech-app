// 로딩 — 스피너 기본. 300ms 이상 대기 예상 시 skeleton 대체
import { ActivityIndicator, Text, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

type LoadingStateProps = {
  label?: string;
  fullscreen?: boolean;
};

export function LoadingState({ label, fullscreen = false }: LoadingStateProps) {
  const scheme = useColorScheme();
  const color = scheme === 'dark' ? '#3B82F6' : '#1E40AF';

  return (
    <View
      className={`${fullscreen ? 'flex-1' : ''} items-center justify-center gap-3 py-8`}
      accessibilityLiveRegion="polite"
      accessibilityLabel={label ?? '불러오는 중'}
    >
      <ActivityIndicator color={color} size="large" />
      {label ? (
        <Text className="text-label text-muted dark:text-muted-dark">{label}</Text>
      ) : null}
    </View>
  );
}
