// 알림 설정 · 스케줄 — Phase 11 에서 expo-notifications 스케줄링 연동
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { NotificationPreference, ScheduledNotification } from '@/types/models';

type NotificationState = {
  prefs: NotificationPreference | null;
  scheduled: ScheduledNotification[];
  loading: boolean;

  loadPrefs: () => Promise<void>;
  updatePrefs: (patch: Partial<NotificationPreference>) => Promise<void>;
  // 앱 foreground 진입 시 호출 — 로컬 알림 재스케줄
  rescheduleAll: () => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  prefs: null,
  scheduled: [],
  loading: false,

  loadPrefs: async () => {
    set({ loading: true });
    const [{ data: prefs }, { data: scheduled }] = await Promise.all([
      supabase.from('notification_preferences').select('*').maybeSingle(),
      supabase.from('scheduled_notifications').select('*'),
    ]);
    set({ prefs: prefs ?? null, scheduled: scheduled ?? [], loading: false });
  },

  updatePrefs: async (patch) => {
    const current = get().prefs;
    if (!current) throw new Error('알림 설정 미로드');

    const { data, error } = await supabase
      .from('notification_preferences')
      .update(patch)
      .eq('user_id', current.user_id)
      .select()
      .single();

    if (error || !data) throw error ?? new Error('알림 설정 갱신 실패');
    set({ prefs: data });
  },

  rescheduleAll: async () => {
    // Phase 11: scheduled 배열 기반으로 expo-notifications 로컬 스케줄 재등록
    // 지금은 노출만 유지
  },
}));
