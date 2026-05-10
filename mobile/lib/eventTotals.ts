// 이벤트 + 혜택 금액 집계 — Phase 8 홈 탭/리포트
import type { Benefit, EventRow, EventStatus } from '@/types/models';

// 이벤트 1건의 benefits 합계
export function sumEventExpected(benefits: Benefit[]): number {
  return benefits.reduce((acc, b) => acc + Number(b.expected_amount ?? 0), 0);
}

// 진행중(active) 상태 — paid/canceled 제외
const ACTIVE_STATUSES: ReadonlySet<EventStatus> = new Set([
  'registered', 'applied', 'in_progress', 'performance_done',
  'pending_payout', 'cancelable',
]);

// 전체 이벤트 + benefitsByEvent 로 확정/예상 분리 합계
export function summarizeEvents(
  events: EventRow[],
  benefitsByEvent: Record<string, Benefit[]>,
): { confirmed: number; expected: number } {
  let confirmed = 0;
  let expected = 0;

  for (const ev of events) {
    const sum = sumEventExpected(benefitsByEvent[ev.id] ?? []);
    if (ev.status === 'paid') confirmed += sum;
    else if (ACTIVE_STATUSES.has(ev.status)) expected += sum;
    // canceled 제외
  }

  return { confirmed, expected };
}
