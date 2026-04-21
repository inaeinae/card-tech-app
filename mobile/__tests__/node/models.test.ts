import { EVENT_STATUS_LABEL, EVENT_STATUS_ORDER } from '@/types/models';

describe('이벤트 상태 모델', () => {
  it('상태 순서는 design/DESIGN.md §7 와 일치한다', () => {
    expect(EVENT_STATUS_ORDER).toEqual([
      'registered',
      'applied',
      'in_progress',
      'performance_done',
      'pending_payout',
      'paid',
      'cancelable',
      'canceled',
    ]);
  });

  it('모든 상태에 한글 라벨이 존재한다', () => {
    for (const status of EVENT_STATUS_ORDER) {
      expect(EVENT_STATUS_LABEL[status]).toBeTruthy();
    }
  });
});
