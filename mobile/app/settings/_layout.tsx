import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

// 설정 스택 레이아웃 — Phase 12에서 mypage 탭이 진입점으로 연결 예정
export default function SettingsLayout() {
  const C = Colors[useResolvedColorScheme()];
  return (
    <Stack
      screenOptions={{
        headerBackTitle: '뒤로',
        // 다크/라이트 자동 — Colors[scheme] 기반
        headerStyle: { backgroundColor: C.bg },
        headerTintColor: C.ink,
        headerTitleStyle: { fontFamily: 'NotoSansKR_500Medium' },
      }}
    >
      <Stack.Screen name="notifications" options={{ title: '알림 설정' }} />
      <Stack.Screen name="profile" options={{ title: '프로필 수정' }} />
      <Stack.Screen name="about" options={{ title: '앱 정보' }} />
    </Stack>
  );
}
