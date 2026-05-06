// 카테크 디자인 토큰 — Pencil 목업(design.pen) $변수와 1:1 매핑
import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Pencil $primary
    primary: '#3182F6',
    primaryPressed: '#1B64DA',
    primarySoft: '#E8F2FE',
    // Pencil $accent
    accent: '#19D294',
    accentSoft: '#E5FAF3',
    // 배경/표면
    bg: '#FFFFFF',
    surface: '#F9FAFB',
    surface2: '#F2F4F6',
    // 텍스트
    ink: '#191F28',
    ink2: '#4E5968',
    ink3: '#8B95A1',
    ink4: '#B0B8C1',
    // 보더
    border: '#F2F4F6',
    borderStrong: '#E5E8EB',
    // 위험/경고
    danger: '#FF4D4F',
    dangerSoft: '#FFF1F0',
    warning: '#F59E0B',
    warningSoft: '#FEF3C7',
    // React Navigation 호환 별칭
    background: '#FFFFFF',
    text: '#191F28',
    tint: '#3182F6',
    icon: '#8B95A1',
    tabIconDefault: '#8B95A1',
    tabIconSelected: '#3182F6',
  },
  dark: {
    primary: '#3B82F6',
    primaryPressed: '#2563EB',
    primarySoft: '#1E3A5F',
    accent: '#10B981',
    accentSoft: '#064E3B',
    bg: '#0F172A',
    surface: '#1E293B',
    surface2: '#334155',
    ink: '#F8FAFC',
    ink2: '#CBD5E1',
    ink3: '#94A3B8',
    ink4: '#64748B',
    border: 'rgba(255,255,255,0.06)',
    borderStrong: 'rgba(255,255,255,0.12)',
    danger: '#EF4444',
    dangerSoft: '#450A0A',
    warning: '#F59E0B',
    warningSoft: '#451A03',
    background: '#0F172A',
    text: '#F8FAFC',
    tint: '#3B82F6',
    icon: '#94A3B8',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#3B82F6',
  },
} as const;

export const Fonts = {
  sans: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  semibold: 'NotoSansKR_600SemiBold',
  bold: 'NotoSansKR_700Bold',
  light: 'NotoSansKR_300Light',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
} as const;
