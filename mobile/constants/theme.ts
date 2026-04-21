// 카테크 디자인 토큰 — design-system/카테크/MASTER.md 와 동기화 유지
// NativeWind(tailwind.config.js) 와 동일 값 사용. 런타임 JS에서 토큰이 필요할 때 참조.

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#1E40AF',
    accent: '#059669',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    foreground: '#0F172A',
    muted: '#64748B',
    border: '#E2E8F0',
    destructive: '#DC2626',
    // React Navigation 호환용 별칭
    text: '#0F172A',
    tint: '#1E40AF',
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: '#1E40AF',
  },
  dark: {
    primary: '#3B82F6',
    accent: '#10B981',
    background: '#0F172A',
    surface: '#1E293B',
    foreground: '#F8FAFC',
    muted: '#94A3B8',
    border: 'rgba(255,255,255,0.08)',
    destructive: '#EF4444',
    // React Navigation 호환용 별칭
    text: '#F8FAFC',
    tint: '#3B82F6',
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#3B82F6',
  },
} as const;

// 폰트 패밀리 토큰 — 기본 Noto Sans KR. rounded/mono 는 기본 템플릿 호환용 별칭 (Phase 5 에서 정리)
const fontFamilies = {
  sans: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  bold: 'NotoSansKR_700Bold',
  light: 'NotoSansKR_300Light',
  rounded: 'NotoSansKR_400Regular',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};

export const Fonts = fontFamilies;
