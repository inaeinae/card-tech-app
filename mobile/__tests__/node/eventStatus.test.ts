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
