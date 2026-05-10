import { sumEventExpected, summarizeEvents } from '@/lib/eventTotals';
import type { Benefit, EventRow } from '@/types/models';

const mkBenefit = (id: string, eventId: string, amount: number): Benefit =>
  ({ id, event_id: eventId, expected_amount: amount } as Benefit);

const mkEvent = (id: string, status: EventRow['status']): EventRow =>
  ({ id, status } as EventRow);

it('sumEventExpected — benefits 합계', () => {
  const benefits = [mkBenefit('b1', 'e1', 5000), mkBenefit('b2', 'e1', 3000)];
  expect(sumEventExpected(benefits)).toBe(8000);
});

it('sumEventExpected — 빈 배열은 0', () => {
  expect(sumEventExpected([])).toBe(0);
});

it('sumEventExpected — null/undefined expected_amount 는 0 처리', () => {
  const benefits = [
    { id: 'b1', event_id: 'e1', expected_amount: null } as unknown as Benefit,
    mkBenefit('b2', 'e1', 5000),
  ];
  expect(sumEventExpected(benefits)).toBe(5000);
});

it('summarizeEvents — paid 는 confirmed, active 상태는 expected', () => {
  const events: EventRow[] = [
    mkEvent('e1', 'paid'),
    mkEvent('e2', 'applied'),
    mkEvent('e3', 'in_progress'),
    mkEvent('e4', 'canceled'),
  ];
  const benefitsByEvent: Record<string, Benefit[]> = {
    e1: [mkBenefit('b1', 'e1', 10000)],
    e2: [mkBenefit('b2', 'e2', 5000), mkBenefit('b3', 'e2', 2000)],
    e3: [mkBenefit('b4', 'e3', 3000)],
    e4: [mkBenefit('b5', 'e4', 99999)],
  };

  const summary = summarizeEvents(events, benefitsByEvent);

  expect(summary.confirmed).toBe(10000);
  expect(summary.expected).toBe(10000); // 5000+2000+3000
});

it('summarizeEvents — benefits 없는 이벤트는 0', () => {
  const events: EventRow[] = [mkEvent('e1', 'applied')];
  const summary = summarizeEvents(events, {});
  expect(summary.confirmed).toBe(0);
  expect(summary.expected).toBe(0);
});
