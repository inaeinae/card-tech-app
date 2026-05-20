// 테마 mode — system/light/dark 사용자 수동 선택, SecureStore 영속
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { colorScheme } from 'nativewind';

export type ThemeMode = 'system' | 'light' | 'dark';
export const THEME_MODE_KEY = 'theme.mode.v1';

type ThemeState = {
  mode: ThemeMode;
  hydrated: boolean;
  loadMode: () => Promise<void>;
  setMode: (mode: ThemeMode) => Promise<void>;
};

function isThemeMode(v: unknown): v is ThemeMode {
  return v === 'system' || v === 'light' || v === 'dark';
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  hydrated: false,

  loadMode: async () => {
    try {
      const raw = await SecureStore.getItemAsync(THEME_MODE_KEY);
      const restored: ThemeMode = isThemeMode(raw) ? raw : 'system';
      set({
        mode: restored,
        hydrated: true,
      });
      // NativeWind 의 dark: variant 가 복원된 mode 에 즉시 반영되도록 동기화
      colorScheme.set(restored);
    } catch {
      // SecureStore 실패 시 시스템 기본값으로 폴백
      set({ mode: 'system', hydrated: true });
      colorScheme.set('system');
    }
  },

  setMode: async (mode) => {
    // SecureStore 먼저 저장 성공 후 state 업데이트 (순서 불일치 방지)
    await SecureStore.setItemAsync(THEME_MODE_KEY, mode);
    set({ mode });
    // NativeWind 의 dark: variant 적용을 위해 색 스키마 동기화
    colorScheme.set(mode);
  },
}));
