// 카드 상시혜택 입력 — 순수 검증 + 정규화 (Phase 5.3)
import type { DiscountMethod } from '@/types/models';

// 혜택 대상 그룹 (예: 생활잡화 → 다이소)
export type BenefitTargetInput = {
  group_label: string;
  merchants: string;
  sort_order: number;
};

// 구간별 한도 (전월실적 기준)
export type BenefitCapTierInput = {
  min_spend_won: number;
  cap_won: number;
  sort_order: number;
};

// 혜택 폼 입력 전체
export type BenefitFormInput = {
  title: string;
  category: string | null;
  discount_pct: number | null;
  discount_method: DiscountMethod | null;
  min_spend_won: number | null;
  monthly_cap_won: number | null;
  overseas_only: boolean;
  notes: string | null;
  targets: BenefitTargetInput[];
  cap_tiers: BenefitCapTierInput[];
};

// 검증 결과 — 필드별 한국어 메시지
export type BenefitFormErrors = Partial<
  Record<
    'title' | 'discount_pct' | 'monthly_cap_won' | 'cap_tiers' | 'targets' | 'min_spend_won',
    string
  >
>;

export function validateBenefit(input: BenefitFormInput): BenefitFormErrors {
  const errors: BenefitFormErrors = {};
  // 제목: 공백만 있으면 안 됨
  if (!input.title || input.title.trim().length === 0) {
    errors.title = '혜택 제목은 필수입니다.';
  }
  // 할인율: 입력 시 0~100 사이
  if (input.discount_pct !== null) {
    if (input.discount_pct < 0 || input.discount_pct > 100) {
      errors.discount_pct = '할인율은 0~100 사이여야 합니다.';
    }
  }
  // 전월실적: 입력 시 0 이상
  if (input.min_spend_won !== null && input.min_spend_won < 0) {
    errors.min_spend_won = '전월실적은 0 이상이어야 합니다.';
  }
  // 단일 한도와 구간 한도는 동시에 사용 불가
  if (input.monthly_cap_won !== null && input.cap_tiers.length > 0) {
    errors.monthly_cap_won = '단일 한도와 구간 한도는 동시에 사용할 수 없습니다.';
  }
  // 구간 한도: 임계값 중복 및 음수 거부
  if (input.cap_tiers.length > 0) {
    const seen = new Set<number>();
    for (const t of input.cap_tiers) {
      if (seen.has(t.min_spend_won)) {
        errors.cap_tiers = '구간 임계값이 중복됩니다.';
        break;
      }
      seen.add(t.min_spend_won);
      if (t.cap_won < 0 || t.min_spend_won < 0) {
        errors.cap_tiers = '구간 값은 0 이상이어야 합니다.';
        break;
      }
    }
  }
  // 대상 구분: 라벨과 가맹점 모두 필수
  for (const t of input.targets) {
    if (!t.group_label.trim() || !t.merchants.trim()) {
      errors.targets = '대상 구분의 라벨과 가맹점은 필수입니다.';
      break;
    }
  }
  return errors;
}

export function normalizeBenefit(input: BenefitFormInput): BenefitFormInput {
  // 메모: trim 후 빈 문자열은 null
  const notes = input.notes?.trim() ?? '';
  // 구간 한도: min_spend 오름차순 + sort_order 재할당
  const sortedTiers = [...input.cap_tiers]
    .sort((a, b) => a.min_spend_won - b.min_spend_won)
    .map((t, i) => ({ ...t, sort_order: i }));
  // 대상 그룹: 라벨/가맹점 trim + sort_order 재할당 (입력 순서 유지)
  const sortedTargets = input.targets.map((t, i) => ({
    ...t,
    group_label: t.group_label.trim(),
    merchants: t.merchants.trim(),
    sort_order: i,
  }));
  return {
    ...input,
    title: input.title.trim(),
    category: input.category?.trim() || null,
    notes: notes.length === 0 ? null : notes,
    cap_tiers: sortedTiers,
    targets: sortedTargets,
  };
}
