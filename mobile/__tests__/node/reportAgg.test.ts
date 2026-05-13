import { summarizeEvents } from '@/lib/eventTotals';
import { countByStatus } from '@/lib/reportAggregate';
import type { Benefit, EventRow } from '@/types/models';

function ev(id: string, status: EventRow['status']): EventRow {
  return {
    id,
    user_id: 'u',
    card_id: 'c',
    title: id,
    issuer_subject: null,
    organizer: null,
    status,
    apply_start: null,
    apply_end: null,
    use_start: null,
    use_end: null,
    payout_expected_at: null,
    payout_actual_at: null,
    payout_expected_period: null,
    cancelable_from: null,
    notes: null,
    status_updated_at: '2026-03-01T00:00:00Z',
    warning_dismissed: false,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  } as unknown as EventRow;
}

function ben(eventId: string, amount: number): Benefit {
  return {
    id: `b-${eventId}-${amount}`,
    event_id: eventId,
    user_id: 'u',
    template_id: null,
    title: 't',
    type: 'cashback',
    expected_amount: amount,
    actual_amount: null,
    spend_required: null,
    spend_actual: null,
    disqualified: false,
    conditions: null,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  } as unknown as Benefit;
}

it('summarizeEvents — paid 는 confirmed, in_progress 는 expected', () => {
  const events = [ev('p1', 'paid'), ev('i1', 'in_progress')];
  const benefitsByEvent = { p1: [ben('p1', 30000)], i1: [ben('i1', 12000)] };
  expect(summarizeEvents(events, benefitsByEvent)).toEqual({ confirmed: 30000, expected: 12000 });
});

it('summarizeEvents — canceled 는 양쪽 모두 제외', () => {
  const events = [ev('c1', 'canceled')];
  expect(summarizeEvents(events, { c1: [ben('c1', 99999)] })).toEqual({ confirmed: 0, expected: 0 });
});

it('summarizeEvents — benefitsByEvent 비어 있으면 0', () => {
  const events = [ev('p1', 'paid'), ev('i1', 'in_progress')];
  expect(summarizeEvents(events, {})).toEqual({ confirmed: 0, expected: 0 });
});

it('countByStatus — paid/inProgress/applied 분리', () => {
  const events = [ev('1', 'paid'), ev('2', 'in_progress'), ev('3', 'applied'), ev('4', 'canceled')];
  expect(countByStatus(events)).toEqual({ paid: 1, inProgress: 1, applied: 1 });
});
