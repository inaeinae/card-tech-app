// 개발용 이메일/비밀번호 로그인 — __DEV__ 환경 + 로컬 Supabase 에서만 허용
import { supabase } from '@/lib/supabase';

function assertDevOnly(): void {
  if (!__DEV__) {
    throw new Error('devAuth is dev only');
  }
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
  // 로컬 Supabase 만 허용 — 원격 프로덕션에 개발 계정이 새는 것을 차단
  const isLocal = /127\.0\.0\.1|localhost|10\.0\.2\.2/.test(url);
  if (!isLocal) {
    throw new Error('devAuth allowed on local Supabase only');
  }
}

export async function signInWithDevEmail(email: string, password: string) {
  assertDevOnly();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithDevEmail(email: string, password: string) {
  assertDevOnly();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}
