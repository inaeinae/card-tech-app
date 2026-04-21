// 인증 라우트 그룹
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      {__DEV__ && <Stack.Screen name="dev-login" options={{ title: '개발자 로그인' }} />}
    </Stack>
  );
}
