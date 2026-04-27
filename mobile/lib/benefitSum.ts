// 혜택 예상 금액 합계 계산 — DESIGN.md 부록 A.4 sub-item 멀티 선택 케이스 반영
import type { DraftBenefit } from '@/stores/wizardStore';

type SubItemRow = { label: string; eligible: boolean; amount: number };

export function computeBenefitAmount(b: DraftBenefit): number {
  const conditions = b.conditions as { items?: SubItemRow[] } | undefined;
  const items = conditions?.items;
  if (Array.isArray(items) && items.length > 0) {
    return items.reduce((acc, it) => acc + (it.eligible ? it.amount || 0 : 0), 0);
  }
  return b.expectedAmount ?? 0;
}

export function computeExpectedTotal(benefits: DraftBenefit[]): number {
  return benefits.reduce((acc, b) => acc + computeBenefitAmount(b), 0);
}
