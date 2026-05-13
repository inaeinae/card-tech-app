// 리포트 탭 그루핑/카운트/필터 순수 함수
// 클라이언트 집계 — Edge Function 미사용 (Phase 1.3 원격 프로젝트 시점에 검토)
import type { EventRow, EventStatus } from '@/types/models';

export type YearKey = string; // "YYYY" 또는 "미분류"
export type MonthKey = string; // "YYYY-MM" 또는 "미분류"
export type PeriodFilter = 'all' | YearKey;

// 진행중으로 간주하는 상태 — paid/applied/canceled 제외 전부
const IN_PROGRESS_STATUSES: ReadonlySet<EventStatus> = new Set([
  'registered',
  'in_progress',
  'performance_done',
  'pending_payout',
  'cancelable',
]);

// use_start 우선, 없으면 created_at 사용. 둘 다 없으면 "미분류"
function pickDateKey(e: EventRow, length: number): string {
  const raw = (e.use_start ?? e.created_at ?? '').slice(0, length);
  return raw || '미분류';
}

export function groupEventsByYear(events: EventRow[]): Record<YearKey, EventRow[]> {
  const map: Record<YearKey, EventRow[]> = {};
  for (const e of events) {
    const k = pickDateKey(e, 4);
    (map[k] ??= []).push(e);
  }
  return map;
}

export function groupEventsByMonth(events: EventRow[]): Record<MonthKey, EventRow[]> {
  const map: Record<MonthKey, EventRow[]> = {};
  for (const e of events) {
    const k = pickDateKey(e, 7);
    (map[k] ??= []).push(e);
  }
  return map;
}

export type StatusCounts = { paid: number; inProgress: number; applied: number };

export function countByStatus(events: EventRow[]): StatusCounts {
  let paid = 0;
  let inProgress = 0;
  let applied = 0;
  for (const e of events) {
    if (e.status === 'paid') paid++;
    else if (e.status === 'applied') applied++;
    else if (IN_PROGRESS_STATUSES.has(e.status)) inProgress++;
    // canceled 는 의도적으로 카운트 제외
  }
  return { paid, inProgress, applied };
}

export function filterByYear(events: EventRow[], period: PeriodFilter): EventRow[] {
  if (period === 'all') return events;
  return events.filter((e) => pickDateKey(e, 4) === period);
}

// 화면 상단 칩 — 미분류 제외, 최신 연도 우선
export function extractYears(events: EventRow[]): YearKey[] {
  const set = new Set<string>();
  for (const e of events) {
    const k = pickDateKey(e, 4);
    if (k !== '미분류') set.add(k);
  }
  return [...set].sort().reverse();
}
