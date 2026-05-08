import { calcAutoStatus, canTransition } from '@/lib/eventStatus';

const today = '2026-05-01';

it('응모 기간 중이면 applied', () => {
  expect(
    calcAutoStatus(
      { apply_start: '2026-04-01', apply_end: '2026-05-31', use_start: '2026-06-01', use_end: '2026-07-31' },
      today,
    ),
  ).toBe('applied');
});

it('이용 기간 중이면 in_progress', () => {
  expect(
    calcAutoStatus(
      { apply_start: '2026-03-01', apply_end: '2026-04-30', use_start: '2026-05-01', use_end: '2026-07-31' },
      today,
    ),
  ).toBe('in_progress');
});

it('이용 기간 종료 후 performance_done', () => {
  expect(
    calcAutoStatus(
      { apply_start: '2026-01-01', apply_end: '2026-02-28', use_start: '2026-03-01', use_end: '2026-04-30' },
      today,
    ),
  ).toBe('performance_done');
});

it('apply_start 이전이면 registered', () => {
  expect(
    calcAutoStatus(
      { apply_start: '2026-06-01', apply_end: '2026-07-31', use_start: '2026-08-01', use_end: '2026-09-30' },
      today,
    ),
  ).toBe('registered');
});

it('canTransition: applied → in_progress 허용', () => {
  expect(canTransition('applied', 'in_progress')).toBe(true);
});

it('canTransition: paid → canceled 불허', () => {
  expect(canTransition('paid', 'canceled')).toBe(false);
});

import { suggestNextStatus, ALLOWED_TRANSITIONS } from '@/lib/eventStatus';

it('payout_expected_at 도래 후 pending_payout 제안', () => {
  expect(
    suggestNextStatus(
      {
        status: 'performance_done',
        apply_start: '2026-01-01', apply_end: '2026-02-28',
        use_start: '2026-03-01', use_end: '2026-04-30',
        payout_expected_at: '2026-05-01',
      },
      '2026-05-01',
    ),
  ).toBe('pending_payout');
});

it('use_end + 6개월 경과 시 cancelable 제안', () => {
  expect(
    suggestNextStatus(
      {
        status: 'paid',
        apply_start: '2025-09-01', apply_end: '2025-09-30',
        use_start: '2025-10-01', use_end: '2025-10-31',
        payout_expected_at: '2025-12-01',
      },
      '2026-05-01',
    ),
  ).toBe('cancelable');
});

it('현재 상태가 자동값과 같으면 null', () => {
  expect(
    suggestNextStatus(
      {
        status: 'applied',
        apply_start: '2026-04-01', apply_end: '2026-05-31',
        use_start: '2026-06-01', use_end: '2026-07-31',
        payout_expected_at: null,
      },
      '2026-05-01',
    ),
  ).toBeNull();
});

it('되감기: applied → registered 허용', () => {
  expect(ALLOWED_TRANSITIONS.applied).toContain('registered');
});

it('되감기: paid → pending_payout 허용', () => {
  expect(ALLOWED_TRANSITIONS.paid).toContain('pending_payout');
});

it('되감기: canceled 는 종결이라 빈 배열', () => {
  expect(ALLOWED_TRANSITIONS.canceled).toEqual([]);
});
