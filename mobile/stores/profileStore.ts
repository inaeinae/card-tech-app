// 프로필(닉네임 등) 상태 — public.profiles 한 row 동기화
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/models';

type ProfileState = {
  profile: Profile | null;
  loading: boolean;
  loadProfile: () => Promise<void>;
  upsertNickname: (nickname: string) => Promise<void>;
  reset: () => void;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,

  loadProfile: async () => {
    set({ loading: true });
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) {
      set({ profile: null, loading: false });
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    // PGRST116 = row not found — 신규 가입 직후 트리거 지연 시 발생 가능
    if (error && error.code !== 'PGRST116') {
      set({ loading: false });
      throw error;
    }
    set({ profile: (data as Profile) ?? null, loading: false });
  },

  upsertNickname: async (nickname) => {
    const trimmed = nickname.trim();
    if (!trimmed) throw new Error('닉네임을 입력해주세요.');
    if (trimmed.length > 20) throw new Error('닉네임은 20자 이내로 입력해주세요.');

    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) throw new Error('로그인이 필요합니다.');

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, nickname: trimmed }, { onConflict: 'id' });
    if (error) throw error;

    const prev = get().profile;
    set({
      profile: prev
        ? { ...prev, nickname: trimmed }
        : ({ id: userId, nickname: trimmed } as Profile),
    });
  },

  reset: () => set({ profile: null, loading: false }),
}));
