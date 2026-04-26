import { computeCancelState, canTransition } from '@/lib/cardCancel';

describe('computeCancelState', () => {
  it('canceled_at 이 있으면 canceled', () => {
    expect(computeCancelState({ canceled_at: '2026-04-01', cancel_scheduled_at: null })).toBe(
      'canceled',
    );
  });

  it('cancel_scheduled_at 만 있으면 scheduled', () => {
    expect(
      computeCancelState({ canceled_at: null, cancel_scheduled_at: '2026-05-01' }),
    ).toBe('scheduled');
  });

  it('둘 다 없으면 active', () => {
    expect(computeCancelState({ canceled_at: null, cancel_scheduled_at: null })).toBe('active');
  });
});

describe('canTransition', () => {
  it('active → scheduled 허용', () => {
    expect(canTransition('active', 'scheduled')).toBe(true);
  });

  it('scheduled → canceled 허용', () => {
    expect(canTransition('scheduled', 'canceled')).toBe(true);
  });

  it('scheduled → active 허용 (예약 취소)', () => {
    expect(canTransition('scheduled', 'active')).toBe(true);
  });

  it('canceled → active 허용 (복구)', () => {
    expect(canTransition('canceled', 'active')).toBe(true);
  });

  it('active → canceled 직행은 금지 (반드시 예약 경유)', () => {
    expect(canTransition('active', 'canceled')).toBe(false);
  });
});
