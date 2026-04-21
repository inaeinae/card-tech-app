// Tailwind (NativeWind v4) 설정 — 카테크 디자인 토큰
// 컬러 규격 참고: design-system/카테크/MASTER.md, design/UI_STRUCTURE.md
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 라이트 테마 토큰
        primary: {
          DEFAULT: '#1E40AF',
          dark: '#3B82F6',
        },
        accent: {
          DEFAULT: '#059669',
          dark: '#10B981',
        },
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          dark: '#1E293B',
        },
        foreground: {
          DEFAULT: '#0F172A',
          dark: '#F8FAFC',
        },
        muted: {
          DEFAULT: '#64748B',
          dark: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          dark: 'rgba(255,255,255,0.08)',
        },
        destructive: {
          DEFAULT: '#DC2626',
          dark: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['NotoSansKR_400Regular'],
        medium: ['NotoSansKR_500Medium'],
        bold: ['NotoSansKR_700Bold'],
        light: ['NotoSansKR_300Light'],
      },
      fontSize: {
        // 타이포 스케일 (Material Design 3 기반 축약)
        'display': ['32px', { lineHeight: '40px' }],
        'title': ['24px', { lineHeight: '32px' }],
        'headline': ['18px', { lineHeight: '28px' }],
        'body': ['16px', { lineHeight: '24px' }],
        'label': ['14px', { lineHeight: '20px' }],
        'caption': ['12px', { lineHeight: '16px' }],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      spacing: {
        // 4/8pt 기반 — Tailwind 기본 유지
      },
    },
  },
  plugins: [],
};
