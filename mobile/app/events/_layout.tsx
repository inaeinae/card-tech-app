// events 스택 — [id] 상세 / [id]/history 공통 헤더
import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

export default function EventsLayout() {
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];
  return (
    <Stack
      screenOptions={{
        // 다크/라이트 자동 — Colors[scheme] 기반
        headerStyle: { backgroundColor: C.bg },
        headerTintColor: C.ink,
        headerTitleStyle: { fontFamily: 'NotoSansKR_500Medium' },
      }}
    >
      <Stack.Screen name="[id]/index" options={{ title: '이벤트 상세' }} />
      <Stack.Screen name="[id]/history" options={{ title: '상태 이력' }} />
    </Stack>
  );
}
