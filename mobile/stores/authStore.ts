// 인증 상태 — Supabase Auth + Kakao 간편 로그인
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { login as kakaoNativeLogin } from '@react-native-seoul/kakao-login';
import { supabase } from '@/lib/supabase';

type AuthState = {
  user: User | null;
  session: Session | null;
  initializing: boolean;
  // Edge Function /kakao-oauth 로 카카오 access_token 검증 후 세션 주입
  signInWithKakao: (kakaoAccessToken: string) => Promise<void>;
  // 카카오 네이티브 SDK 로그인 → signInWithKakao 재사용
  signInWithKakaoNative: () => Promise<void>;
  signOut: () => Promise<void>;
  // 계정 완전 탈퇴 — Edge Function 호출 후 세션 파기
  deleteAccount: () => Promise<void>;
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
    supabase.auth.onAuthStateChange((event, session) => {
      set({ session, user: session?.user ?? null });
      // TOKEN_REFRESHED 실패로 세션이 null 이 되면 AuthGate 가 (auth) 로 밀어냄
      if (event === 'SIGNED_OUT') {
        set({ session: null, user: null });
      }
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

  signInWithKakaoNative: async () => {
    // 1. 카카오 SDK 로 네이티브 로그인 → access_token 획득
    const result = await kakaoNativeLogin();
    // 2. 기존 signInWithKakao 로직 재사용
    await useAuthStore.getState().signInWithKakao(result.accessToken);
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  deleteAccount: async () => {
    const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    if (error) throw error;
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
