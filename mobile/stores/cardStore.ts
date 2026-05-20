// 카드 목록 · CRUD · 상시혜택(정규화 모델) · 해지 머신
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type {
  Card,
  CardBenefit,
  CardBenefitCapTier,
  CardBenefitTarget,
  DiscountMethod,
} from '@/types/models';
import type { Database } from '@/lib/database.types';

type CardInsert = Database['public']['Tables']['cards']['Insert'];
type CardUpdate = Database['public']['Tables']['cards']['Update'];

// 정규화 혜택 입력 — id 가 없는 새 자식행 형태 (insert payload)
export type BenefitPayload = {
  title: string;
  category: string | null;
  discount_pct: number | null;
  discount_method: DiscountMethod | null;
  min_spend_won: number | null;
  monthly_cap_won: number | null;
  overseas_only: boolean;
  notes: string | null;
  targets: Omit<CardBenefitTarget, 'id'>[];
  cap_tiers: Omit<CardBenefitCapTier, 'id'>[];
};

// 위저드/편집 중 로컬 보관용 초안 — BenefitPayload + localId
export type DraftCardBenefit = BenefitPayload & {
  localId: string;
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
    payload: BenefitPayload,
    existingId?: string,
  ) => Promise<CardBenefit>;
  deleteCardBenefit: (benefitId: string, cardId: string) => Promise<void>;
  scheduleCancel: (cardId: string, scheduledAt: string) => Promise<void>;
  confirmCancel: (cardId: string, canceledAt: string) => Promise<void>;
  restoreCancel: (cardId: string) => Promise<void>;
  addDraftBenefit: (payload: BenefitPayload) => void;
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
    // card_type 컬럼은 DB 상 string 이지만 도메인은 CardType union 으로 좁힌다
    set({ cards: (data ?? []) as unknown as Card[], loading: false });
  },

  upsertCard: async (payload) => {
    const { data, error } = await supabase
      .from('cards')
      .upsert(payload as CardInsert)
      .select()
      .single();
    if (error || !data) throw error ?? new Error('카드 저장 실패');
    const row = data as unknown as Card;
    const next = [row, ...get().cards.filter((c) => c.id !== row.id)];
    set({ cards: next });
    return row;
  },

  loadCardBenefits: async (cardId) => {
    // 자식 테이블 조인 — Postgrest embedding 으로 targets/cap_tiers 동시 로드
    const { data, error } = await supabase
      .from('card_benefits')
      .select('*, targets:card_benefit_targets(*), cap_tiers:card_benefit_cap_tiers(*)')
      .eq('card_id', cardId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    set({
      benefits: { ...get().benefits, [cardId]: (data ?? []) as unknown as CardBenefit[] },
    });
  },

  upsertCardBenefit: async (cardId, payload, existingId) => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error('세션 없음');
    const userId = authData.user.id;

    // 1) 부모 행 upsert (정규화 컬럼 평탄화)
    const row = {
      ...(existingId ? { id: existingId } : {}),
      card_id: cardId,
      user_id: userId,
      title: payload.title,
      category: payload.category,
      discount_pct: payload.discount_pct,
      discount_method: payload.discount_method,
      min_spend_won: payload.min_spend_won,
      monthly_cap_won: payload.monthly_cap_won,
      overseas_only: payload.overseas_only,
      notes: payload.notes,
    };

    const { data: benefitRow, error: upsertErr } = await supabase
      .from('card_benefits')
      .upsert(row)
      .select()
      .single();
    if (upsertErr || !benefitRow) throw upsertErr ?? new Error('혜택 저장 실패');

    const benefitId = (benefitRow as { id: string }).id;

    // 2) 편집 시 기존 자식 행은 모두 삭제 (단순 replace 전략)
    if (existingId) {
      const { error: delTargetsErr } = await supabase
        .from('card_benefit_targets')
        .delete()
        .eq('benefit_id', existingId);
      if (delTargetsErr) throw delTargetsErr;
      const { error: delTiersErr } = await supabase
        .from('card_benefit_cap_tiers')
        .delete()
        .eq('benefit_id', existingId);
      if (delTiersErr) throw delTiersErr;
    }

    // 3) targets insert
    if (payload.targets.length > 0) {
      const { error } = await supabase.from('card_benefit_targets').insert(
        payload.targets.map((t) => ({
          benefit_id: benefitId,
          user_id: userId,
          group_label: t.group_label,
          merchants: t.merchants,
          sort_order: t.sort_order,
        })),
      );
      if (error) throw error;
    }

    // 4) cap_tiers insert
    if (payload.cap_tiers.length > 0) {
      const { error } = await supabase.from('card_benefit_cap_tiers').insert(
        payload.cap_tiers.map((t) => ({
          benefit_id: benefitId,
          user_id: userId,
          min_spend_won: t.min_spend_won,
          cap_won: t.cap_won,
          sort_order: t.sort_order,
        })),
      );
      if (error) throw error;
    }

    // 5) 조인 select 로 재조회 → 일관된 CardBenefit 형태로 store 갱신
    await get().loadCardBenefits(cardId);
    return benefitRow as unknown as CardBenefit;
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
          ...payload,
        },
      ],
    })),

  removeDraftBenefit: (localId) =>
    set((state) => ({
      draftBenefits: state.draftBenefits.filter((b) => b.localId !== localId),
    })),

  clearDraftBenefits: () => set({ draftBenefits: [] }),
}));
