import { Stack } from 'expo-router';

// 설정 스택 레이아웃 — Phase 12에서 mypage 탭이 진입점으로 연결 예정
export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: '뒤로',
      }}
    >
      <Stack.Screen name="notifications" options={{ title: '알림 설정' }} />
      <Stack.Screen name="profile" options={{ title: '프로필 수정' }} />
      <Stack.Screen name="about" options={{ title: '앱 정보' }} />
    </Stack>
  );
}
