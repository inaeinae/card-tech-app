// 날짜 기반 자동 상태 계산 — Phase 7 상태 머신
import type { EventStatus } from '@/types/models';

type EventDates = {
  apply_start: string | null;
  apply_end: string | null;
  use_start: string | null;
  use_end: string | null;
  payout_expected_at?: string | null;
};

type EventForSuggestion = EventDates & { status: EventStatus };

// "use_end + 6개월" 을 cancelable 시그널로 사용 (DESIGN §4 6개월 대기)
function addMonthsISO(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function calcAutoStatus(dates: EventDates, today: string): EventStatus {
  const { apply_start, apply_end, use_start, use_end, payout_expected_at } = dates;

  if (apply_start && today < apply_start) return 'registered';
  if (apply_start && apply_end && today >= apply_start && today <= apply_end) return 'applied';
  if (use_start && use_end && today >= use_start && today <= use_end) return 'in_progress';

  if (payout_expected_at && today >= payout_expected_at) {
    if (use_end && today >= addMonthsISO(use_end, 6)) return 'cancelable';
    return 'pending_payout';
  }

  if (use_end && today > use_end) {
    if (today >= addMonthsISO(use_end, 6)) return 'cancelable';
    return 'performance_done';
  }
  return 'registered'; // 날짜 미설정(draft) 상태
}

// 현재 상태와 자동값이 다르고 정상 진행(되감기 아님) 인 경우에만 제안
export function suggestNextStatus(
  event: EventForSuggestion,
  today: string,
): EventStatus | null {
  const auto = calcAutoStatus(event, today);
  if (auto === event.status) return null;

  // paid → cancelable 는 정방향 취급 — use_end+6개월 자동 전이 대상이 paid 상태이기 때문
  const order = [
    'registered', 'applied', 'in_progress', 'performance_done',
    'pending_payout', 'paid', 'cancelable', 'canceled',
  ] as const;
  const fromIdx = order.indexOf(event.status);
  const toIdx = order.indexOf(auto);
  if (fromIdx < 0 || toIdx < 0) return null;
  // 자동 제안은 진행 방향만 (되감기는 사용자 수동 전이)
  if (toIdx <= fromIdx) return null;
  return auto;
}

// 정상 전이(앞으로) + 되감기(이전 상태) 매핑.
// canceled 는 종결, paid 도 종결 직전이지만 되감기는 허용.
export const ALLOWED_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  registered:       ['applied'],
  applied:          ['in_progress', 'canceled', 'registered'],
  in_progress:      ['performance_done', 'canceled', 'applied'],
  performance_done: ['pending_payout', 'canceled', 'in_progress'],
  pending_payout:   ['paid', 'canceled', 'performance_done'],
  paid:             ['cancelable', 'pending_payout'],
  cancelable:       ['canceled', 'paid'],
  canceled:         [],
};

export function canTransition(from: EventStatus, to: EventStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
