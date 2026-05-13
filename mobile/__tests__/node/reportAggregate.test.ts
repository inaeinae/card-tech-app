import {
  groupEventsByYear,
  groupEventsByMonth,
  countByStatus,
  filterByYear,
  extractYears,
  type YearKey,
} from '@/lib/reportAggregate';
import type { EventRow } from '@/types/models';

function ev(overrides: Partial<EventRow>): EventRow {
  return {
    id: 'e1',
    user_id: 'u',
    card_id: 'c',
    title: '이벤트',
    issuer_subject: null,
    status: 'applied',
    apply_start: null,
    apply_end: null,
    use_start: null,
    use_end: null,
    payout_expected_at: null,
    payout_expected_period: null,
    cancelable_from: null,
    notes: null,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
    ...overrides,
  } as EventRow;
}

it('groupEventsByYear — use_start 우선, 없으면 created_at 의 YYYY', () => {
  const a = ev({ id: 'a', use_start: '2025-12-01', created_at: '2026-01-01T00:00:00Z' });
  const b = ev({ id: 'b', use_start: null, created_at: '2024-08-15T00:00:00Z' });
  const c = ev({ id: 'c', use_start: '2026-03-10' });
  const map = groupEventsByYear([a, b, c]);
  expect(Object.keys(map).sort()).toEqual(['2024', '2025', '2026']);
  expect(map['2025'].map((e) => e.id)).toEqual(['a']);
  expect(map['2024'].map((e) => e.id)).toEqual(['b']);
  expect(map['2026'].map((e) => e.id)).toEqual(['c']);
});

it('groupEventsByYear — 날짜 둘 다 없으면 "미분류"', () => {
  const x = ev({ id: 'x', use_start: null, created_at: '' });
  const map = groupEventsByYear([x]);
  expect(map['미분류'].map((e) => e.id)).toEqual(['x']);
});

it('groupEventsByMonth — YYYY-MM 키 사용', () => {
  const a = ev({ id: 'a', use_start: '2026-03-15' });
  const b = ev({ id: 'b', use_start: '2026-03-28' });
  const c = ev({ id: 'c', use_start: '2026-04-01' });
  const map = groupEventsByMonth([a, b, c]);
  expect(Object.keys(map).sort()).toEqual(['2026-03', '2026-04']);
  expect(map['2026-03'].map((e) => e.id).sort()).toEqual(['a', 'b']);
});

it('countByStatus — paid / 진행중 / applied 분리 집계', () => {
  const rows: EventRow[] = [
    ev({ id: '1', status: 'paid' }),
    ev({ id: '2', status: 'paid' }),
    ev({ id: '3', status: 'in_progress' }),
    ev({ id: '4', status: 'performance_done' }),
    ev({ id: '5', status: 'applied' }),
    ev({ id: '6', status: 'canceled' }),
  ];
  expect(countByStatus(rows)).toEqual({ paid: 2, inProgress: 2, applied: 1 });
});

it('countByStatus — registered / pending_payout / cancelable 도 진행중에 포함', () => {
  const rows: EventRow[] = [
    ev({ id: 'r', status: 'registered' }),
    ev({ id: 'p', status: 'pending_payout' }),
    ev({ id: 'c', status: 'cancelable' }),
  ];
  expect(countByStatus(rows)).toEqual({ paid: 0, inProgress: 3, applied: 0 });
});

it('filterByYear — "all" 은 원본 반환', () => {
  const rows = [ev({ id: 'a', use_start: '2025-01-01' }), ev({ id: 'b', use_start: '2026-01-01' })];
  expect(filterByYear(rows, 'all').map((e) => e.id)).toEqual(['a', 'b']);
});

it('filterByYear — 특정 연도 prefix 매칭', () => {
  const rows = [
    ev({ id: 'a', use_start: '2025-01-01' }),
    ev({ id: 'b', use_start: '2026-01-01' }),
    ev({ id: 'c', use_start: null, created_at: '2026-09-01T00:00:00Z' }),
  ];
  const out = filterByYear(rows, '2026' as YearKey);
  expect(out.map((e) => e.id).sort()).toEqual(['b', 'c']);
});

it('extractYears — 내림차순 정렬 후 반환, 미분류 제외', () => {
  const rows = [
    ev({ id: 'a', use_start: '2024-05-01' }),
    ev({ id: 'b', use_start: '2026-03-01' }),
    ev({ id: 'c', use_start: '2025-12-01' }),
    ev({ id: 'd', use_start: null, created_at: '' }),
  ];
  expect(extractYears(rows)).toEqual(['2026', '2025', '2024']);
});
