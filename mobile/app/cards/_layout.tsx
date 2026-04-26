// cards 스택 — new / [id] / [id]/edit 공통 헤더
import { Stack } from 'expo-router';

export default function CardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontFamily: 'NotoSansKR_500Medium' },
      }}
    >
      <Stack.Screen name="new" options={{ title: '카드 등록', presentation: 'modal' }} />
      <Stack.Screen name="[id]/index" options={{ title: '카드 상세' }} />
      <Stack.Screen name="[id]/edit" options={{ title: '카드 수정' }} />
    </Stack>
  );
}
