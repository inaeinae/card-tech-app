// cards 스택 — new / [id] / [id]/edit 공통 헤더
import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

export default function CardsLayout() {
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
      <Stack.Screen name="new" options={{ title: '카드 등록', presentation: 'modal' }} />
      <Stack.Screen name="[id]/index" options={{ title: '카드 상세' }} />
      <Stack.Screen name="[id]/edit" options={{ title: '카드 수정' }} />
    </Stack>
  );
}
