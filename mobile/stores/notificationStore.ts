// 알림 설정 · 스케줄 — Phase 11 expo-notifications 로컬 스케줄 연동
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { EventRow, NotificationPreference, ScheduledNotification } from '@/types/models';
import {
  buildEventNotifications,
  withinWindow,
  type PlannedNotification,
} from '@/lib/notifications/scheduler';
import {
  cancelAllLocal,
  scheduleLocal,
} from '@/lib/notifications/expoBridge';
import {
  getPermissionStatus,
  requestPermission as requestOsPermission,
  type PermissionStatus,
} from '@/lib/notifications/permissions';

type NotificationState = {
  prefs: NotificationPreference | null;
  scheduled: ScheduledNotification[];
  permission: PermissionStatus;
  loading: boolean;

  loadPrefs: () => Promise<void>;
  updatePrefs: (patch: Partial<NotificationPreference>) => Promise<void>;

  refreshPermission: () => Promise<PermissionStatus>;
  requestPermission: () => Promise<PermissionStatus>;

  syncEventSchedule: (event: EventRow) => Promise<void>;
  cancelEventSchedule: (eventId: string) => Promise<void>;

  rescheduleAll: (now?: Date) => Promise<void>;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  prefs: null,
  scheduled: [],
  permission: 'undetermined',
  loading: false,

  loadPrefs: async () => {
    set({ loading: true });
    const [{ data: prefs }, { data: scheduled }] = await Promise.all([
      supabase.from('notification_preferences').select('*').maybeSingle(),
      supabase.from('scheduled_notifications').select('*').eq('canceled', false),
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

  refreshPermission: async () => {
    const status = await getPermissionStatus();
    set({ permission: status });
    return status;
  },

  requestPermission: async () => {
    const status = await requestOsPermission();
    set({ permission: status });
    return status;
  },

  syncEventSchedule: async (event) => {
    const prefs = get().prefs;
    if (!prefs) return;

    await supabase
      .from('scheduled_notifications')
      .delete()
      .eq('event_id', event.id)
      .eq('canceled', false);

    const planned = buildEventNotifications(event, prefs);
    if (planned.length === 0) {
      set({ scheduled: get().scheduled.filter((s) => s.event_id !== event.id) });
      return;
    }

    const rows = planned.map((p) => ({
      user_id: event.user_id,
      event_id: p.event_id,
      kind: p.kind,
      fire_at: new Date(p.fire_at).toISOString(),
      title: p.title,
      body: p.body,
      canceled: false,
    }));
    const { data: inserted, error } = await supabase
      .from('scheduled_notifications')
      .insert(rows)
      .select();
    if (error || !inserted) return;

    const windowed = withinWindow(planned, new Date());
    await Promise.all(windowed.map((p) => scheduleLocal(p)));

    const next = [
      ...get().scheduled.filter((s) => s.event_id !== event.id),
      ...inserted,
    ];
    set({ scheduled: next });
  },

  cancelEventSchedule: async (eventId) => {
    await supabase
      .from('scheduled_notifications')
      .update({ canceled: true })
      .eq('event_id', eventId);

    set({ scheduled: get().scheduled.filter((s) => s.event_id !== eventId) });
  },

  rescheduleAll: async (now = new Date()) => {
    await cancelAllLocal();

    const active = get().scheduled.filter((s) => !s.canceled);
    const planned: PlannedNotification[] = active.map((s) => ({
      event_id: s.event_id ?? '',
      kind: s.kind,
      fire_at: s.fire_at.slice(0, 19),
      title: s.title,
      body: s.body,
    }));
    const windowed = withinWindow(planned, now);
    await Promise.all(windowed.map((p) => scheduleLocal(p)));
  },
}));
