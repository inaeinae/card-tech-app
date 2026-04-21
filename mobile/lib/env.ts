// 환경 변수 검증 — Expo public prefix 필수
// 누락 시 앱 부팅 단계에서 조기 실패 (fail-fast)

const required = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};

for (const [key, value] of Object.entries(required)) {
  if (!value) {
    throw new Error(`[env] 필수 환경 변수 누락: EXPO_PUBLIC_${key}. .env.local 확인.`);
  }
}

export const env = {
  SUPABASE_URL: required.SUPABASE_URL!,
  SUPABASE_ANON_KEY: required.SUPABASE_ANON_KEY!,
} as const;
