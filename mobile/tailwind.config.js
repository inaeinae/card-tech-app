// Tailwind (NativeWind v4) 설정 — 카테크 디자인 토큰
// 컬러 규격 참고: design-system/카테크/MASTER.md, design/UI_STRUCTURE.md
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 본 토큰 (Pencil/theme.ts 1:1)
        primary: {
          DEFAULT: '#3182F6',
          pressed: '#1B64DA',
          soft: '#E8F2FE',
          dark: '#3B82F6',
          darkPressed: '#2563EB',
          darkSoft: '#1E3A5F',
        },
        accent: {
          DEFAULT: '#19D294',
          soft: '#E5FAF3',
          dark: '#10B981',
          darkSoft: '#064E3B',
        },
        bg: {
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',
        },
        surface: {
          DEFAULT: '#F9FAFB',
          dark: '#1E293B',
        },
        'surface-2': {
          DEFAULT: '#F2F4F6',
          dark: '#334155',
        },
        ink: {
          DEFAULT: '#191F28',
          dark: '#F8FAFC',
        },
        'ink-2': {
          DEFAULT: '#4E5968',
          dark: '#CBD5E1',
        },
        'ink-3': {
          DEFAULT: '#8B95A1',
          dark: '#94A3B8',
        },
        'ink-4': {
          DEFAULT: '#B0B8C1',
          dark: '#64748B',
        },
        border: {
          DEFAULT: '#F2F4F6',
          dark: 'rgba(255,255,255,0.06)',
        },
        'border-strong': {
          DEFAULT: '#E5E8EB',
          dark: 'rgba(255,255,255,0.12)',
        },
        danger: {
          DEFAULT: '#FF4D4F',
          soft: '#FFF1F0',
          dark: '#EF4444',
          darkSoft: '#450A0A',
        },
        warning: {
          DEFAULT: '#F59E0B',
          soft: '#FEF3C7',
          dark: '#F59E0B',
          darkSoft: '#451A03',
        },

        // 별칭 — Phase 5.3 이전 코드 호환 (background/foreground/muted/destructive)
        background: { DEFAULT: '#FFFFFF', dark: '#0F172A' },
        foreground: { DEFAULT: '#191F28', dark: '#F8FAFC' },
        muted: { DEFAULT: '#8B95A1', dark: '#94A3B8' },
        destructive: { DEFAULT: '#FF4D4F', dark: '#EF4444' },
      },
      fontFamily: {
        sans: ['NotoSansKR_400Regular'],
        medium: ['NotoSansKR_500Medium'],
        bold: ['NotoSansKR_700Bold'],
        light: ['NotoSansKR_300Light'],
      },
      fontSize: {
        // 타이포 스케일 (Material Design 3 기반 축약)
        display: ['32px', { lineHeight: '40px' }],
        title: ['24px', { lineHeight: '32px' }],
        headline: ['18px', { lineHeight: '28px' }],
        body: ['16px', { lineHeight: '24px' }],
        label: ['14px', { lineHeight: '20px' }],
        caption: ['12px', { lineHeight: '16px' }],
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      spacing: {
        // 4/8pt 기반 — Tailwind 기본 유지
      },
    },
  },
  plugins: [],
};
