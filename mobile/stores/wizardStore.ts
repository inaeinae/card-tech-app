// 이벤트 생성 위저드 임시 상태 — 저장은 최종 Step4 에서 eventStore 경유
import { create } from 'zustand';
import type { BenefitType, EventStatus } from '@/types/models';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import { computeBenefitAmount } from '@/lib/benefitSum';

type EventInsert = Database['public']['Tables']['events']['Insert'];
type BenefitInsert = Database['public']['Tables']['benefits']['Insert'];

export type WizardStep = 1 | 2 | 3 | 4;

export type DraftBenefit = {
  // 클라이언트 임시 ID — 저장 시 서버 UUID 로 치환
  tempId: string;
  templateId: string;
  type: BenefitType;
  label: string;
  expectedAmount?: number;
  conditions?: Record<string, unknown>;
  subItems?: string[];
};

export type DraftEvent = {
  cardId?: string;
  title?: string;
  organizer?: string;
  applyStart?: string;
  applyEnd?: string;
  useStart?: string;
  useEnd?: string;
  payoutExpectedAt?: string;
  payoutExpectedPeriod?: string;
  cancelableFrom?: string;
  notes?: string;
  status?: EventStatus;
  benefits: DraftBenefit[];
};

type WizardState = {
  step: WizardStep;
  draft: DraftEvent;
  setStep: (step: WizardStep) => void;
  patchDraft: (patch: Partial<DraftEvent>) => void;
  addBenefit: (benefit: Omit<DraftBenefit, 'tempId'>) => void;
  updateBenefit: (tempId: string, patch: Partial<DraftBenefit>) => void;
  removeBenefit: (tempId: string) => void;
  reset: () => void;
  submit: (params: { eventId?: string }) => Promise<{ eventId: string }>;
  loadFromEvent: (eventId: string) => Promise<void>;
};

const emptyDraft = (): DraftEvent => ({ benefits: [] });

export const useWizardStore = create<WizardState>((set, get) => ({
  step: 1,
  draft: emptyDraft(),

  setStep: (step) => set({ step }),

  patchDraft: (patch) =>
    set((state) => ({ draft: { ...state.draft, ...patch } })),

  addBenefit: (benefit) =>
    set((state) => ({
      draft: {
        ...state.draft,
        benefits: [...state.draft.benefits, { ...benefit, tempId: cryptoRandomId() }],
      },
    })),

  updateBenefit: (tempId, patch) =>
    set((state) => ({
      draft: {
        ...state.draft,
        benefits: state.draft.benefits.map((b) => (b.tempId === tempId ? { ...b, ...patch } : b)),
      },
    })),

  removeBenefit: (tempId) =>
    set((state) => ({
      draft: {
        ...state.draft,
        benefits: state.draft.benefits.filter((b) => b.tempId !== tempId),
      },
    })),

  reset: () => set({ step: 1, draft: emptyDraft() }),

  // 위저드 저장 — 마지막 Step4 에서 호출. eventId 없으면 create, 있으면 update.
  submit: async ({ eventId }) => {
    const draft = get().draft;
    if (!draft.cardId || !draft.title) {
      throw new Error('카드/이벤트명이 누락되었습니다.');
    }
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId) throw new Error('세션이 없습니다.');

    const eventPayload: EventInsert = {
      ...(eventId ? { id: eventId } : {}),
      user_id: userId,
      card_id: draft.cardId,
      title: draft.title,
      organizer: draft.organizer ?? null,
      apply_start: draft.applyStart ?? null,
      apply_end: draft.applyEnd ?? null,
      use_start: draft.useStart ?? null,
      use_end: draft.useEnd ?? null,
      payout_expected_at: draft.payoutExpectedAt ?? null,
      payout_expected_period: draft.payoutExpectedPeriod ?? null,
      cancelable_from: draft.cancelableFrom ?? null,
      notes: draft.notes ?? null,
    };

    const { data: row, error: upsertError } = await supabase
      .from('events')
      .upsert(eventPayload)
      .select()
      .single();
    if (upsertError || !row) throw upsertError ?? new Error('이벤트 저장 실패');

    if (eventId) {
      const { error: delError } = await supabase.from('benefits').delete().eq('event_id', row.id);
      if (delError) throw delError;
    }

    if (draft.benefits.length > 0) {
      const rows: BenefitInsert[] = draft.benefits.map((b) => ({
        event_id: row.id,
        user_id: userId,
        template_id: b.templateId,
        title: b.label,
        type: b.type,
        expected_amount: computeBenefitAmount(b),
        conditions: (b.conditions as Database['public']['Tables']['benefits']['Insert']['conditions']) ?? {},
      }));
      const { error: bErr } = await supabase.from('benefits').insert(rows);
      if (bErr) throw bErr;
    }

    if (!eventId) {
      const { error: hErr } = await supabase.from('event_status_history').insert({
        event_id: row.id,
        user_id: userId,
        from_status: null,
        to_status: 'registered',
        is_auto: false,
      });
      if (hErr) throw hErr;

      if (draft.useEnd) {
        await supabase
          .from('cards')
          .update({ last_event_at: draft.useEnd })
          .eq('id', draft.cardId);
      }
    }

    return { eventId: row.id };
  },

  // 이벤트 상세에서 "수정" 진입 시 — 기존 row + benefits 를 draft 로 로드
  loadFromEvent: async (eventId) => {
    const { data: ev, error: evErr } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();
    if (evErr || !ev) throw evErr ?? new Error('이벤트 없음');

    const { data: bs, error: bErr } = await supabase
      .from('benefits')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });
    if (bErr) throw bErr;

    set({
      step: 2,
      draft: {
        cardId: ev.card_id,
        title: ev.title,
        organizer: ev.organizer ?? undefined,
        applyStart: ev.apply_start ?? undefined,
        applyEnd: ev.apply_end ?? undefined,
        useStart: ev.use_start ?? undefined,
        useEnd: ev.use_end ?? undefined,
        payoutExpectedAt: ev.payout_expected_at ?? undefined,
        payoutExpectedPeriod: ev.payout_expected_period ?? undefined,
        cancelableFrom: ev.cancelable_from ?? undefined,
        notes: ev.notes ?? undefined,
        status: ev.status,
        benefits: (bs ?? []).map((b) => ({
          tempId: `srv_${b.id}`,
          templateId: b.template_id ?? 'custom',
          type: b.type,
          label: b.title,
          expectedAmount: Number(b.expected_amount ?? 0),
          conditions: (b.conditions as Record<string, unknown>) ?? {},
        })),
      },
    });
  },
}));

// 경량 UUID — RN 에 crypto.randomUUID 없을 수 있어 fallback 포함
function cryptoRandomId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `tmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
