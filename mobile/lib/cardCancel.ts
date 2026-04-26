// 카드 해지 상태 머신 — active ↔ scheduled ↔ canceled
// design/UI_STRUCTURE.md §5.3 해지 흐름 참고
export type CardCancelState = 'active' | 'scheduled' | 'canceled';

export function computeCancelState(card: {
  canceled_at: string | null;
  cancel_scheduled_at: string | null;
}): CardCancelState {
  if (card.canceled_at) return 'canceled';
  if (card.cancel_scheduled_at) return 'scheduled';
  return 'active';
}

const ALLOWED: Record<CardCancelState, CardCancelState[]> = {
  active: ['scheduled'],
  scheduled: ['active', 'canceled'],
  canceled: ['active'],
};

export function canTransition(from: CardCancelState, to: CardCancelState): boolean {
  return ALLOWED[from].includes(to);
}
