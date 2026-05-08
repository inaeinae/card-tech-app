// 카드 목록 · CRUD · 상시혜택 · 해지 머신
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Card, CardBenefit } from '@/types/models';
import type { Database, Json } from '@/lib/database.types';

type CardInsert = Database['public']['Tables']['cards']['Insert'];
type CardUpdate = Database['public']['Tables']['cards']['Update'];

export type DraftCardBenefit = {
  localId: string;
  title: string;
  details?: Record<string, unknown> | null;
};

type CardState = {
  cards: Card[];
  benefits: Record<string, CardBenefit[]>;
  draftBenefits: DraftCardBenefit[];
  loading: boolean;
  error: string | null;
  loadCards: () => Promise<void>;
  upsertCard: (payload: CardInsert | (CardUpdate & { id: string })) => Promise<Card>;
  loadCardBenefits: (cardId: string) => Promise<void>;
  upsertCardBenefit: (
    cardId: string,
    payload: { title: string; details?: Record<string, unknown> | null },
    existingId?: string,
  ) => Promise<CardBenefit>;
  deleteCardBenefit: (benefitId: string, cardId: string) => Promise<void>;
  scheduleCancel: (cardId: string, scheduledAt: string) => Promise<void>;
  confirmCancel: (cardId: string, canceledAt: string) => Promise<void>;
  restoreCancel: (cardId: string) => Promise<void>;
  addDraftBenefit: (payload: { title: string; details?: Record<string, unknown> | null }) => void;
  removeDraftBenefit: (localId: string) => void;
  clearDraftBenefits: () => void;
};

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  benefits: {},
  draftBenefits: [],
  loading: false,
  error: null,

  loadCards: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
      return;
    }
    set({ cards: data ?? [], loading: false });
  },

  upsertCard: async (payload) => {
    const { data, error } = await supabase
      .from('cards')
      .upsert(payload as CardInsert)
      .select()
      .single();
    if (error || !data) throw error ?? new Error('카드 저장 실패');
    const next = [data, ...get().cards.filter((c) => c.id !== data.id)];
    set({ cards: next });
    return data;
  },

  loadCardBenefits: async (cardId) => {
    const { data, error } = await supabase
      .from('card_benefits')
      .select('*')
      .eq('card_id', cardId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    set({ benefits: { ...get().benefits, [cardId]: data ?? [] } });
  },

  upsertCardBenefit: async (cardId, payload, existingId) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error('세션 없음');

    const row = {
      ...(existingId ? { id: existingId } : {}),
      card_id: cardId,
      user_id: authData.user.id,
      title: payload.title,
      // Supabase jsonb 컬럼은 Json 타입을 요구하므로 캐스트
      details: (payload.details ?? null) as Json | null,
    };

    const { data, error } = await supabase
      .from('card_benefits')
      .upsert(row)
      .select()
      .single();
    if (error || !data) throw error ?? new Error('혜택 저장 실패');

    const current = get().benefits[cardId] ?? [];
    const next = existingId
      ? current.map((b) => (b.id === existingId ? data : b))
      : [...current, data];
    set({ benefits: { ...get().benefits, [cardId]: next } });
    return data;
  },

  deleteCardBenefit: async (benefitId, cardId) => {
    const { error } = await supabase.from('card_benefits').delete().eq('id', benefitId);
    if (error) throw error;
    const current = get().benefits[cardId] ?? [];
    set({ benefits: { ...get().benefits, [cardId]: current.filter((b) => b.id !== benefitId) } });
  },

  scheduleCancel: async (cardId, scheduledAt) => {
    const patch = { cancel_scheduled_at: scheduledAt, canceled_at: null };
    const { error } = await supabase.from('cards').update(patch).eq('id', cardId);
    if (error) throw error;
    set({
      cards: get().cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
    });
  },

  confirmCancel: async (cardId, canceledAt) => {
    const patch = { canceled_at: canceledAt };
    const { error } = await supabase.from('cards').update(patch).eq('id', cardId);
    if (error) throw error;
    set({
      cards: get().cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
    });
  },

  restoreCancel: async (cardId) => {
    const patch = { canceled_at: null, cancel_scheduled_at: null };
    const { error } = await supabase.from('cards').update(patch).eq('id', cardId);
    if (error) throw error;
    set({
      cards: get().cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c)),
    });
  },

  addDraftBenefit: (payload) =>
    set((state) => ({
      draftBenefits: [
        ...state.draftBenefits,
        {
          localId: `cb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          title: payload.title,
          details: payload.details ?? null,
        },
      ],
    })),

  removeDraftBenefit: (localId) =>
    set((state) => ({
      draftBenefits: state.draftBenefits.filter((b) => b.localId !== localId),
    })),

  clearDraftBenefits: () => set({ draftBenefits: [] }),
}));
