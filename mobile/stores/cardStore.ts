// 카드 목록 · CRUD · 상시혜택 · 해지 머신
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Card, CardBenefit } from '@/types/models';
import type { Database } from '@/lib/database.types';

type CardInsert = Database['public']['Tables']['cards']['Insert'];
type CardUpdate = Database['public']['Tables']['cards']['Update'];

type CardState = {
  cards: Card[];
  benefits: Record<string, CardBenefit[]>;
  loading: boolean;
  error: string | null;
  loadCards: () => Promise<void>;
  upsertCard: (payload: CardInsert | (CardUpdate & { id: string })) => Promise<Card>;
  loadCardBenefits: (cardId: string) => Promise<void>;
  scheduleCancel: (cardId: string, scheduledAt: string) => Promise<void>;
  confirmCancel: (cardId: string, canceledAt: string) => Promise<void>;
  restoreCancel: (cardId: string) => Promise<void>;
};

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  benefits: {},
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
}));
