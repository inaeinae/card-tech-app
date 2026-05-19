// 카드 등록/수정 폼 — 순수 검증 + 정규화
import type { CardType } from '@/types/models';

export type CardFormInput = {
  issuer: string;
  name: string;
  notes: string | null;
  card_type: CardType | null;
  annual_fee_won: number | null;
  base_min_spend_won: number | null;
};

export type CardFormErrors = Partial<
  Record<
    'issuer' | 'name' | 'notes' | 'card_type' | 'annual_fee_won' | 'base_min_spend_won',
    string
  >
>;

const NAME_MAX = 32;

export function validateCardForm(input: CardFormInput): CardFormErrors {
  const errors: CardFormErrors = {};
  if (!input.issuer || input.issuer.trim().length === 0) {
    errors.issuer = '카드사는 필수입니다.';
  }
  if (!input.name || input.name.trim().length === 0) {
    errors.name = '카드명은 필수입니다.';
  } else if (input.name.trim().length > NAME_MAX) {
    errors.name = `카드명은 ${NAME_MAX}자 이하여야 합니다.`;
  }
  // 카드 종류: domestic/overseas 중 하나 필수
  if (input.card_type !== 'domestic' && input.card_type !== 'overseas') {
    errors.card_type = '카드 종류는 필수입니다.';
  }
  // 연회비: 입력 시 0 이상
  if (input.annual_fee_won !== null && input.annual_fee_won < 0) {
    errors.annual_fee_won = '연회비는 0 이상이어야 합니다.';
  }
  // 전월실적: 입력 시 0 이상
  if (input.base_min_spend_won !== null && input.base_min_spend_won < 0) {
    errors.base_min_spend_won = '전월실적은 0 이상이어야 합니다.';
  }
  return errors;
}

export function normalizeCardForm(input: CardFormInput): CardFormInput {
  const notes = input.notes?.trim() ?? '';
  return {
    issuer: input.issuer.trim(),
    name: input.name.trim(),
    notes: notes.length === 0 ? null : notes,
    card_type: input.card_type,
    annual_fee_won: input.annual_fee_won,
    base_min_spend_won: input.base_min_spend_won,
  };
}
