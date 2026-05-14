import {
  buildEventNotifications,
  withinWindow,
  type PlannedNotification,
} from '@/lib/notifications/scheduler';
import type { EventRow, NotificationPreference } from '@/types/models';

function ev(overrides: Partial<EventRow>): EventRow {
  return {
    id: 'e1',
    user_id: 'u1',
    card_id: 'c1',
    title: '이벤트',
    organizer: null,
    status: 'applied',
    apply_start: null,
    apply_end: null,
    use_start: null,
    use_end: null,
    payout_expected_at: null,
    payout_actual_at: null,
    payout_expected_period: null,
    cancelable_from: null,
    notes: null,
    status_updated_at: '2026-05-15T00:00:00Z',
    warning_dismissed: false,
    created_at: '2026-05-15T00:00:00Z',
    updated_at: '2026-05-15T00:00:00Z',
    ...overrides,
  } as unknown as EventRow;
}

function prefs(overrides: Partial<NotificationPreference> = {}): NotificationPreference {
  return {
    user_id: 'u1',
    global_enabled: true,
    kinds_enabled: {
      apply_deadline: true,
      performance_check: true,
      payout_upcoming: true,
      cancel_available: true,
      autopay_check: true,
    },
    time_of_day: '09:00:00',
    updated_at: '2026-05-15T00:00:00Z',
    ...overrides,
  } as NotificationPreference;
}

it('apply_deadline — apply_end 1일 전 09:00', () => {
  const e = ev({ apply_end: '2026-06-10' });
  const out = buildEventNotifications(e, prefs());
  const target = out.find((n) => n.kind === 'apply_deadline')!;
  expect(target.fire_at).toBe('2026-06-09T09:00:00');
  expect(target.title).toContain('응모 마감');
  expect(target.body).toContain('이벤트');
});

it('payout_upcoming — payout_expected_at 7일 전', () => {
  const e = ev({ payout_expected_at: '2026-08-20' });
  const out = buildEventNotifications(e, prefs());
  const target = out.find((n) => n.kind === 'payout_upcoming')!;
  expect(target.fire_at).toBe('2026-08-13T09:00:00');
});

it('cancel_available — cancelable_from 1일 전', () => {
  const e = ev({ cancelable_from: '2026-09-01' });
  const out = buildEventNotifications(e, prefs());
  const target = out.find((n) => n.kind === 'cancel_available')!;
  expect(target.fire_at).toBe('2026-08-31T09:00:00');
});

it('performance_check — use_start~use_end 사이의 15일 + 말일 전부 포함', () => {
  const e = ev({ use_start: '2026-06-01', use_end: '2026-07-31' });
  const out = buildEventNotifications(e, prefs());
  const dates = out
    .filter((n) => n.kind === 'performance_check')
    .map((n) => n.fire_at)
    .sort();
  expect(dates).toEqual([
    '2026-06-15T09:00:00',
    '2026-06-30T09:00:00',
    '2026-07-15T09:00:00',
    '2026-07-31T09:00:00',
  ]);
});

it('time_of_day 반영 — 21:30 으로 변경 시 모든 fire_at 의 시간 부분 갱신', () => {
  const e = ev({ apply_end: '2026-06-10', payout_expected_at: '2026-08-20' });
  const out = buildEventNotifications(e, prefs({ time_of_day: '21:30:00' }));
  for (const n of out) expect(n.fire_at.endsWith('T21:30:00')).toBe(true);
});

it('global_enabled=false 면 빈 배열', () => {
  const e = ev({ apply_end: '2026-06-10' });
  expect(buildEventNotifications(e, prefs({ global_enabled: false }))).toEqual([]);
});

it('kinds_enabled.apply_deadline=false 면 apply_deadline 제외', () => {
  const e = ev({ apply_end: '2026-06-10', payout_expected_at: '2026-08-20' });
  const out = buildEventNotifications(
    e,
    prefs({
      kinds_enabled: {
        apply_deadline: false,
        performance_check: true,
        payout_upcoming: true,
        cancel_available: true,
        autopay_check: true,
      },
    }),
  );
  expect(out.find((n) => n.kind === 'apply_deadline')).toBeUndefined();
  expect(out.find((n) => n.kind === 'payout_upcoming')).toBeDefined();
});

it('canceled / paid 이벤트는 빈 배열 — 이미 종결된 상태', () => {
  const e1 = ev({ status: 'canceled', apply_end: '2026-06-10' });
  const e2 = ev({ status: 'paid', payout_expected_at: '2026-08-20' });
  expect(buildEventNotifications(e1, prefs())).toEqual([]);
  expect(buildEventNotifications(e2, prefs())).toEqual([]);
});

it('관련 날짜가 null 이면 해당 종 생략', () => {
  const e = ev({ apply_end: null, payout_expected_at: null, cancelable_from: null });
  const out = buildEventNotifications(e, prefs());
  expect(out).toEqual([]);
});

it('withinWindow — now 이전 / now+60일 이후 제외', () => {
  const now = new Date('2026-05-15T00:00:00Z');
  const list: PlannedNotification[] = [
    { event_id: 'e', kind: 'apply_deadline', fire_at: '2026-05-14T09:00:00', title: 't', body: 'b' },
    { event_id: 'e', kind: 'apply_deadline', fire_at: '2026-06-10T09:00:00', title: 't', body: 'b' },
    { event_id: 'e', kind: 'apply_deadline', fire_at: '2026-08-01T09:00:00', title: 't', body: 'b' },
  ];
  const out = withinWindow(list, now);
  expect(out.map((n) => n.fire_at)).toEqual(['2026-06-10T09:00:00']);
});
