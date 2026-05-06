// 날짜 기반 자동 상태 계산 — Phase 7 상태 머신
import type { EventStatus } from '@/types/models';

type DateRange = {
  apply_start: string | null;
  apply_end: string | null;
  use_start: string | null;
  use_end: string | null;
};

export function calcAutoStatus(dates: DateRange, today: string): EventStatus {
  const { apply_start, apply_end, use_start, use_end } = dates;

  if (apply_start && today < apply_start) return 'registered';
  if (apply_start && apply_end && today >= apply_start && today <= apply_end) return 'applied';
  if (use_start && use_end && today >= use_start && today <= use_end) return 'in_progress';
  if (use_end && today > use_end) return 'performance_done';
  return 'registered';
}

// 허용되는 수동 전이 맵
export const ALLOWED_TRANSITIONS: Partial<Record<EventStatus, EventStatus[]>> = {
  registered: ['applied'],
  applied: ['in_progress', 'canceled'],
  in_progress: ['performance_done', 'canceled'],
  performance_done: ['pending_payout', 'canceled'],
  pending_payout: ['paid', 'canceled'],
  paid: [],
  cancelable: ['canceled'],
  canceled: [],
};

export function canTransition(from: EventStatus, to: EventStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
