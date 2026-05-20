import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colorScheme } from 'nativewind';

import {
  useFonts,
  NotoSansKR_300Light,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_600SemiBold,
  NotoSansKR_700Bold,
} from '@expo-google-fonts/noto-sans-kr';

import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import { useThemeStore } from '@/stores/themeStore';
import { AuthGate } from '@/components/auth/AuthGate';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const resolvedColorScheme = useResolvedColorScheme();
  const themeMode = useThemeStore((s) => s.mode);
  const loadThemeMode = useThemeStore((s) => s.loadMode);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const initializing = useAuthStore((s) => s.initializing);

  const [fontsLoaded] = useFonts({
    NotoSansKR_300Light,
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_600SemiBold,
    NotoSansKR_700Bold,
  });

  // 앱 시작 시 세션 복원 + 변경 리스너 등록 (1회)
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // 테마 prefs 1회 로드 (system/light/dark)
  useEffect(() => {
    loadThemeMode();
  }, [loadThemeMode]);

  // mode 변경 시 NativeWind 색 스키마 동기화 (store 액션 외부 변경 대비 안전망)
  useEffect(() => {
    colorScheme.set(themeMode);
  }, [themeMode]);

  // Phase 11: 인증 완료 후 알림 prefs / 권한 로드 + foreground 재스케줄
  const loadPrefs = useNotificationStore((s) => s.loadPrefs);
  const refreshPermission = useNotificationStore((s) => s.refreshPermission);
  const rescheduleAll = useNotificationStore((s) => s.rescheduleAll);
  const userId = useAuthStore((s) => s.session?.user.id);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      await loadPrefs();
      await refreshPermission();
      await rescheduleAll();
    })();

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') {
        rescheduleAll().catch((e) => console.warn('rescheduleAll 실패:', e));
      }
    });
    return () => sub.remove();
  }, [userId, loadPrefs, refreshPermission, rescheduleAll]);

  useEffect(() => {
    if (fontsLoaded && !initializing) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, initializing]);

  if (!fontsLoaded || initializing) return null;

  return (
    // SafeAreaProvider: 하위 SafeAreaView 가 정확한 inset 을 반환하도록 루트에서 래핑
    <SafeAreaProvider>
      <ThemeProvider value={resolvedColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen
              name="modals/status-change"
              options={{
                presentation: 'transparentModal',
                animation: 'slide_from_bottom',
                headerShown: false,
              }}
            />
          </Stack>
        </AuthGate>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
