import {
  validateEventInfo,
  computeReuseWarning,
  type EventInfoInput,
} from '@/lib/eventForm';

const baseInput: EventInfoInput = {
  cardId: 'c1',
  title: 'BC ZONE 25만원 페이백',
  organizer: '카카오페이',
  applyStart: '2026-02-01',
  applyEnd: '2026-02-28',
  useStart: '2026-02-01',
  useEnd: '2026-03-31',
  noPriorPaymentChecked: true,
};

describe('validateEventInfo', () => {
  it('완전한 입력이면 에러 없음', () => {
    expect(validateEventInfo(baseInput)).toEqual({});
  });

  it('title 빈값은 에러', () => {
    expect(validateEventInfo({ ...baseInput, title: '   ' }).title).toMatch(/필수/);
  });

  it('cardId 누락은 에러', () => {
    expect(validateEventInfo({ ...baseInput, cardId: undefined }).cardId).toMatch(/카드/);
  });

  it('apply_start > apply_end 는 에러', () => {
    expect(
      validateEventInfo({ ...baseInput, applyStart: '2026-03-01', applyEnd: '2026-02-01' })
        .applyEnd,
    ).toMatch(/순서/);
  });

  it('use_start > use_end 는 에러', () => {
    expect(
      validateEventInfo({ ...baseInput, useStart: '2026-04-01', useEnd: '2026-03-01' }).useEnd,
    ).toMatch(/순서/);
  });

  it('noPriorPaymentChecked 미체크는 에러', () => {
    expect(
      validateEventInfo({ ...baseInput, noPriorPaymentChecked: false }).noPriorPaymentChecked,
    ).toMatch(/확인/);
  });
});

describe('computeReuseWarning', () => {
  it('lastEventAt 가 null 이면 경고 없음', () => {
    expect(computeReuseWarning({ lastEventAt: null, today: '2026-04-27' })).toBeNull();
  });

  it('lastEventAt 6개월 이전이면 경고 없음', () => {
    expect(computeReuseWarning({ lastEventAt: '2025-09-01', today: '2026-04-27' })).toBeNull();
  });

  it('lastEventAt 5개월 전이면 1개월 더 대기 메시지', () => {
    const w = computeReuseWarning({ lastEventAt: '2025-11-27', today: '2026-04-27' });
    expect(w).not.toBeNull();
    expect(w?.monthsRemaining).toBe(1);
    expect(w?.message).toMatch(/1개월/);
  });

  it('lastEventAt 정확히 6개월 전이면 경고 없음 (경계)', () => {
    expect(computeReuseWarning({ lastEventAt: '2025-10-27', today: '2026-04-27' })).toBeNull();
  });
});
