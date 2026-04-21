// 이벤트 생성 위저드 임시 상태 — 저장은 최종 Step4 에서 eventStore 경유
import { create } from 'zustand';
import type { BenefitType, EventStatus } from '@/types/models';

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
};

const emptyDraft = (): DraftEvent => ({ benefits: [] });

export const useWizardStore = create<WizardState>((set) => ({
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
}));

// 경량 UUID — RN 에 crypto.randomUUID 없을 수 있어 fallback 포함
function cryptoRandomId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `tmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
