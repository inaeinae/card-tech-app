// 카드 목록 · CRUD — RLS 로 사용자별 격리
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Card } from '@/types/models';
import type { Database } from '@/lib/database.types';

type CardInsert = Database['public']['Tables']['cards']['Insert'];
type CardUpdate = Database['public']['Tables']['cards']['Update'];

type CardState = {
  cards: Card[];
  loading: boolean;
  error: string | null;
  loadCards: () => Promise<void>;
  upsertCard: (payload: CardInsert | (CardUpdate & { id: string })) => Promise<Card>;
  cancelCard: (cardId: string, canceledAt: string) => Promise<void>;
};

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
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

  cancelCard: async (cardId, canceledAt) => {
    const { error } = await supabase
      .from('cards')
      .update({ canceled_at: canceledAt })
      .eq('id', cardId);

    if (error) throw error;

    const next = get().cards.map((c) => (c.id === cardId ? { ...c, canceled_at: canceledAt } : c));
    set({ cards: next });
  },
}));
