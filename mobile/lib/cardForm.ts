// 카드 등록/수정 폼 — 순수 검증 + 정규화
export type CardFormInput = {
  issuer: string;
  name: string;
  notes: string | null;
};

export type CardFormErrors = Partial<Record<'issuer' | 'name' | 'notes', string>>;

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
  return errors;
}

export function normalizeCardForm(input: CardFormInput): CardFormInput {
  const notes = input.notes?.trim() ?? '';
  return {
    issuer: input.issuer.trim(),
    name: input.name.trim(),
    notes: notes.length === 0 ? null : notes,
  };
}
