import type { EventStatus } from '@/types/models';

type FilterChip = 'all' | 'active' | 'done' | 'canceled';

const ACTIVE = new Set<EventStatus>(['registered', 'applied', 'in_progress', 'performance_done', 'pending_payout', 'cancelable']);
const DONE = new Set<EventStatus>(['paid']);
const CANCELED = new Set<EventStatus>(['canceled']);

function filterEvents(events: { status: EventStatus }[], chip: FilterChip) {
  if (chip === 'all') return events;
  if (chip === 'active') return events.filter((e) => ACTIVE.has(e.status));
  if (chip === 'done') return events.filter((e) => DONE.has(e.status));
  if (chip === 'canceled') return events.filter((e) => CANCELED.has(e.status));
  return events;
}

it('all 필터는 전체 반환', () => {
  const events = [{ status: 'applied' as EventStatus }, { status: 'paid' as EventStatus }];
  expect(filterEvents(events, 'all')).toHaveLength(2);
});
it('active 필터는 applied 만 포함', () => {
  const events = [{ status: 'applied' as EventStatus }, { status: 'paid' as EventStatus }];
  expect(filterEvents(events, 'active')).toHaveLength(1);
});
it('done 필터는 paid 만 포함', () => {
  const events = [{ status: 'applied' as EventStatus }, { status: 'paid' as EventStatus }];
  expect(filterEvents(events, 'done')).toHaveLength(1);
});
it('canceled 필터는 canceled 만 포함', () => {
  const events = [{ status: 'applied' as EventStatus }, { status: 'canceled' as EventStatus }];
  expect(filterEvents(events, 'canceled')).toHaveLength(1);
});
