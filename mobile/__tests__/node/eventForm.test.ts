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
});

// 카드사 기준 active 이벤트 노티 — v1 정책상 6개월 고정 제한 제거, 단순 노티만.
describe('computeReuseWarning', () => {
  const cards = [
    { id: 'c1', issuer: 'BC카드' },
    { id: 'c2', issuer: 'BC카드' },
    { id: 'c3', issuer: '삼성카드' },
  ];

  const activeEvent = (card_id: string) => ({ card_id, status: 'applied' });
  const paidEvent = (card_id: string) => ({ card_id, status: 'paid' });

  it('선택 카드 없으면 null', () => {
    expect(
      computeReuseWarning({ selectedCardId: undefined, cards, events: [activeEvent('c2')] }),
    ).toBeNull();
  });

  it('같은 카드사의 다른 카드에 active 이벤트가 있으면 노티', () => {
    const w = computeReuseWarning({
      selectedCardId: 'c1',
      cards,
      events: [activeEvent('c2')],
    });
    expect(w).not.toBeNull();
    expect(w?.count).toBe(1);
    expect(w?.message).toMatch(/BC카드/);
  });

  it('다른 카드사의 active 이벤트는 카운트 안 함', () => {
    expect(
      computeReuseWarning({
        selectedCardId: 'c1',
        cards,
        events: [activeEvent('c3')],
      }),
    ).toBeNull();
  });

  it('paid/canceled 같은 종료 상태는 카운트 안 함', () => {
    expect(
      computeReuseWarning({
        selectedCardId: 'c1',
        cards,
        events: [paidEvent('c2'), { card_id: 'c2', status: 'canceled' }],
      }),
    ).toBeNull();
  });

  it('동일 카드 자기 자신의 이벤트는 카운트에서 제외 (재등록 시 노이즈 방지)', () => {
    expect(
      computeReuseWarning({
        selectedCardId: 'c1',
        cards,
        events: [activeEvent('c1')],
      }),
    ).toBeNull();
  });
});
