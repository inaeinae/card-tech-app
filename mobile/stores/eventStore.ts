// 이벤트 목록 · 상태 전이 — Phase 7 상태 머신과 연동
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { EventRow, EventStatus } from '@/types/models';
import type { Database } from '@/lib/database.types';

type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

type EventFilter = {
  cardId?: string;
  status?: EventStatus;
};

type EventState = {
  events: EventRow[];
  activeEvent: EventRow | null;
  loading: boolean;
  error: string | null;
  benefitsByEvent: Record<string, import('@/types/models').Benefit[]>;

  loadEvents: (filter?: EventFilter) => Promise<void>;
  loadEventBenefits: () => Promise<void>;
  setActive: (eventId: string | null) => void;
  upsertEvent: (payload: EventInsert | (EventUpdate & { id: string })) => Promise<EventRow>;
  // 상태 전이 + 이력 기록 — Phase 7 에서 완성
  changeStatus: (eventId: string, to: EventStatus, isAuto: boolean) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
};

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  activeEvent: null,
  loading: false,
  error: null,
  benefitsByEvent: {},

  loadEvents: async (filter) => {
    set({ loading: true, error: null });
    let query = supabase.from('events').select('*').order('created_at', { ascending: false });

    if (filter?.cardId) query = query.eq('card_id', filter.cardId);
    if (filter?.status) query = query.eq('status', filter.status);

    const { data, error } = await query;

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ events: data ?? [], loading: false });
  },

  loadEventBenefits: async () => {
    const ids = get().events.map((e) => e.id);
    if (ids.length === 0) {
      set({ benefitsByEvent: {} });
      return;
    }

    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .in('event_id', ids);

    if (error) {
      set({ error: error.message });
      return;
    }

    const grouped: Record<string, import('@/types/models').Benefit[]> = {};
    for (const row of data ?? []) {
      const list = grouped[row.event_id] ?? [];
      list.push(row);
      grouped[row.event_id] = list;
    }
    set({ benefitsByEvent: grouped });
  },

  setActive: (eventId) => {
    set({ activeEvent: eventId ? get().events.find((e) => e.id === eventId) ?? null : null });
  },

  upsertEvent: async (payload) => {
    const isInsert = !('id' in payload) || !payload.id;

    const { data, error } = await supabase
      .from('events')
      .upsert(payload as EventInsert)
      .select()
      .single();

    if (error || !data) throw error ?? new Error('이벤트 저장 실패');

    if (isInsert) {
      // 첫 history 기록 — from_status=null, is_auto=false
      const { error: logError } = await supabase.from('event_status_history').insert({
        event_id: data.id,
        user_id: data.user_id,
        from_status: null,
        to_status: data.status,
        is_auto: false,
      });
      // history 기록 실패는 비치명적 — 이벤트 저장을 롤백하지 않음
      if (logError) {
        console.error('event_status_history insert 실패:', logError.message);
      }
    }

    const next = [data, ...get().events.filter((e) => e.id !== data.id)];
    set({ events: next });

    // Phase 11: 알림 스케줄 동기화 — 실패는 비치명적
    try {
      const { useNotificationStore } = await import('@/stores/notificationStore');
      await useNotificationStore.getState().syncEventSchedule(data);
    } catch (e) {
      console.warn('알림 동기화 실패 (비치명):', e);
    }

    return data;
  },

  changeStatus: async (eventId, to, isAuto) => {
    const current = get().events.find((e) => e.id === eventId);
    if (!current) throw new Error(`이벤트 없음: ${eventId}`);

    // 로그 insert 에 user_id 필요 — RLS 검증과 별개로 명시적 기록
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error('세션 없음 — 상태 변경 불가');

    // events.status 갱신 + event_status_history 로그 (트랜잭션은 Edge Function 또는 DB 트리거로 이동 예정)
    const { error: updateError } = await supabase
      .from('events')
      .update({ status: to, status_updated_at: new Date().toISOString() })
      .eq('id', eventId);

    if (updateError) throw updateError;

    const { error: logError } = await supabase.from('event_status_history').insert({
      event_id: eventId,
      user_id: authData.user.id,
      from_status: current.status,
      to_status: to,
      is_auto: isAuto,
    });

    if (logError) throw logError;

    const next = get().events.map((e) =>
      e.id === eventId ? { ...e, status: to, status_updated_at: new Date().toISOString() } : e,
    );
    set({ events: next });
  },

  // 이벤트 삭제 — cascade 로 benefits / event_status_history 자동 정리
  deleteEvent: async (id) => {
    // Phase 11: 삭제 전 알림 정리
    try {
      const { useNotificationStore } = await import('@/stores/notificationStore');
      await useNotificationStore.getState().cancelEventSchedule(id);
    } catch (e) {
      console.warn('알림 정리 실패 (비치명):', e);
    }

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
    set({ events: get().events.filter((e) => e.id !== id) });
  },
}));
