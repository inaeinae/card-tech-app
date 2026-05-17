// 테마 mode — system/light/dark 사용자 수동 선택, SecureStore 영속
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

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
    const raw = await SecureStore.getItemAsync(THEME_MODE_KEY);
    set({
      mode: isThemeMode(raw) ? raw : 'system',
      hydrated: true,
    });
  },

  setMode: async (mode) => {
    set({ mode });
    await SecureStore.setItemAsync(THEME_MODE_KEY, mode);
  },
}));
