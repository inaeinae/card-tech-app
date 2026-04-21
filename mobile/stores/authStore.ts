// 인증 상태 — Supabase Auth + Kakao 간편 로그인 (Phase 4 에서 signInWithKakao 구현)
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthState = {
  user: User | null;
  session: Session | null;
  initializing: boolean;
  // Edge Function /kakao-oauth 로 카카오 access_token 검증 후 세션 주입
  signInWithKakao: (kakaoAccessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  // 앱 시작 시 SecureStore 에서 세션 복원
  bootstrap: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  initializing: true,

  bootstrap: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, user: data.session?.user ?? null, initializing: false });

    // 세션 변화 감지 → 스토어 동기화
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signInWithKakao: async (kakaoAccessToken) => {
    // Edge Function 호출 → Supabase 세션 JWT 획득
    const { data, error } = await supabase.functions.invoke<{
      access_token: string;
      refresh_token: string;
    }>('kakao-oauth', {
      body: { access_token: kakaoAccessToken },
    });

    if (error || !data) {
      throw error ?? new Error('kakao-oauth 응답 없음');
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

    if (sessionError) throw sessionError;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
