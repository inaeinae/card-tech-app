// Zustand v5 selector 안정성 회귀 가드
// 배경: Zustand v5 는 useSyncExternalStore 를 사용하므로, useStore((s) => ...) selector 가
// 매 호출 새 참조(.filter()/.map()/?? [] 결과)를 반환하면 snapshot 이 매 렌더 달라져
// "Maximum update depth exceeded" 무한 리렌더가 발생한다.
// 규칙: selector 는 store 의 raw slice 만 반환하고, 파생(filter/fallback)은 컴포넌트 body 에서 한다.
import { useEventStore } from '@/stores/eventStore';
import { useCardStore } from '@/stores/cardStore';
import type { EventRow } from '@/types/models';

// jest.mock 은 babel-jest 가 import 위로 hoist 한다 (supabase → env 로더 회피)
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({}),
    auth: { getUser: () => Promise.resolve({ data: { user: null } }) },
  },
}));

const evt = (id: string, card_id: string): EventRow =>
  ({ id, card_id, status: 'registered', title: id }) as unknown as EventRow;

describe('Zustand selector 참조 안정성', () => {
  afterEach(() => {
    useEventStore.setState({ events: [], benefitsByEvent: {} });
    useCardStore.setState({ cards: [], benefits: {} });
  });

  it('raw slice 선택은 변이 없으면 동일 참조를 반환한다 (스크린이 의존하는 계약)', () => {
    useEventStore.setState({ events: [evt('e1', 'c1'), evt('e2', 'c2')] });
    const a = useEventStore.getState().events;
    const b = useEventStore.getState().events;
    expect(a).toBe(b);

    useCardStore.setState({ benefits: { c1: [] } });
    expect(useCardStore.getState().benefits).toBe(useCardStore.getState().benefits);
  });

  it('selector 내부 .filter() 는 매 호출 새 배열을 만든다 → selector 밖에서 파생해야 함', () => {
    useEventStore.setState({ events: [evt('e1', 'c1'), evt('e2', 'c2')] });
    const sel = (s: ReturnType<typeof useEventStore.getState>) =>
      s.events.filter((e) => e.card_id === 'c1');
    // 동일 state 인데도 두 호출 결과가 다른 참조 → useSyncExternalStore 무한루프 유발
    expect(sel(useEventStore.getState())).not.toBe(sel(useEventStore.getState()));
  });

  it('?? [] 폴백도 매 호출 새 배열을 만든다 → selector 밖에서 파생해야 함', () => {
    useCardStore.setState({ benefits: {} });
    const sel = (s: ReturnType<typeof useCardStore.getState>) => s.benefits['missing'] ?? [];
    expect(sel(useCardStore.getState())).not.toBe(sel(useCardStore.getState()));
  });
});
