import {
  extractMilestoneDates,
  groupEventsByDate,
  type DateString,
} from '@/lib/calendarDots';
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

it('extractMilestoneDates — 6종 milestone 일자 모두 추출', () => {
  const e = ev({
    apply_start: '2026-05-01',
    apply_end: '2026-05-10',
    use_start: '2026-05-15',
    use_end: '2026-06-15',
    payout_expected_at: '2026-07-01',
    cancelable_from: '2026-12-01',
  });
  const dates = extractMilestoneDates(e);
  expect(dates).toEqual([
    '2026-05-01',
    '2026-05-10',
    '2026-05-15',
    '2026-06-15',
    '2026-07-01',
    '2026-12-01',
  ]);
});

it('extractMilestoneDates — null 필드는 건너뜀', () => {
  const e = ev({ apply_start: '2026-05-01', use_start: '2026-05-15' });
  expect(extractMilestoneDates(e)).toEqual(['2026-05-01', '2026-05-15']);
});

it('extractMilestoneDates — ISO datetime 도 YYYY-MM-DD 로 자름', () => {
  const e = ev({ apply_start: '2026-05-01T12:34:56Z' });
  expect(extractMilestoneDates(e)).toEqual(['2026-05-01']);
});

it('groupEventsByDate — 일자별 이벤트 묶음 (중복 제거)', () => {
  const a = ev({ id: 'a', apply_start: '2026-05-01', use_start: '2026-05-01' });
  const b = ev({ id: 'b', apply_start: '2026-05-01' });
  const c = ev({ id: 'c', payout_expected_at: '2026-05-02' });
  const map = groupEventsByDate([a, b, c]);
  const keys: DateString[] = Object.keys(map).sort() as DateString[];
  expect(keys).toEqual(['2026-05-01', '2026-05-02']);
  expect(map['2026-05-01'].map((e) => e.id).sort()).toEqual(['a', 'b']);
  expect(map['2026-05-02'].map((e) => e.id)).toEqual(['c']);
});
