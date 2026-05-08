// useCardStore 확장 동작 — Supabase 모킹 후 상태·분기 검증
const mockUpdate = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}));

import { useCardStore } from '@/stores/cardStore';

describe('cardStore 확장', () => {
  beforeEach(() => {
    mockUpdate.mockReset();
    mockSelect.mockReset();
    mockFrom.mockReset();
    useCardStore.setState({ cards: [], benefits: {}, loading: false, error: null });
  });

  it('scheduleCancel 은 cancel_scheduled_at 만 set 하고 canceled_at 은 null 유지', async () => {
    mockUpdate.mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    mockFrom.mockReturnValue({ update: mockUpdate });

    useCardStore.setState({
      cards: [
        {
          id: 'c1',
          user_id: 'u',
          issuer: 'BC',
          name: 'x',
          canceled_at: null,
          cancel_scheduled_at: null,
        } as never,
      ],
    });

    await useCardStore.getState().scheduleCancel('c1', '2026-05-01');

    expect(mockUpdate).toHaveBeenCalledWith({
      cancel_scheduled_at: '2026-05-01',
      canceled_at: null,
    });
    expect(useCardStore.getState().cards[0].cancel_scheduled_at).toBe('2026-05-01');
  });

  it('restoreCancel 은 두 필드 모두 null 로 리셋', async () => {
    mockUpdate.mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
    mockFrom.mockReturnValue({ update: mockUpdate });

    useCardStore.setState({
      cards: [
        {
          id: 'c1',
          user_id: 'u',
          issuer: 'BC',
          name: 'x',
          canceled_at: '2026-04-01',
          cancel_scheduled_at: '2026-03-01',
        } as never,
      ],
    });

    await useCardStore.getState().restoreCancel('c1');

    expect(mockUpdate).toHaveBeenCalledWith({
      canceled_at: null,
      cancel_scheduled_at: null,
    });
    const c = useCardStore.getState().cards[0];
    expect(c.canceled_at).toBeNull();
    expect(c.cancel_scheduled_at).toBeNull();
  });

  it('loadCardBenefits 는 benefits 맵에 card_id 별로 저장', async () => {
    const order = jest.fn().mockResolvedValue({
      data: [
        { id: 'b1', card_id: 'c1', title: '커피 10%', details: {} },
        { id: 'b2', card_id: 'c1', title: '교통 5%', details: {} },
      ],
      error: null,
    });
    mockSelect.mockReturnValue({ eq: jest.fn().mockReturnValue({ order }) });
    mockFrom.mockReturnValue({ select: mockSelect });

    await useCardStore.getState().loadCardBenefits('c1');

    expect(useCardStore.getState().benefits.c1).toHaveLength(2);
  });
});

describe('cardBenefit actions exist', () => {
  it('upsertCardBenefit 액션이 스토어에 존재한다', () => {
    const store = useCardStore.getState();
    expect(typeof store.upsertCardBenefit).toBe('function');
  });
  it('deleteCardBenefit 액션이 스토어에 존재한다', () => {
    const store = useCardStore.getState();
    expect(typeof store.deleteCardBenefit).toBe('function');
  });
});

describe('cardStore.draftBenefits', () => {
  beforeEach(() => {
    useCardStore.setState({ draftBenefits: [] } as never);
  });

  it('addDraftBenefit 은 localId 가 부여된 항목을 끝에 추가한다', () => {
    useCardStore.getState().addDraftBenefit({ title: '커피 10% 할인' });
    useCardStore.getState().addDraftBenefit({ title: '해외 적립', details: { rate: 1.5 } });
    const list = useCardStore.getState().draftBenefits;
    expect(list).toHaveLength(2);
    expect(list[0].title).toBe('커피 10% 할인');
    expect(list[0].localId).toBeTruthy();
    expect(list[1].details).toEqual({ rate: 1.5 });
    expect(list[0].localId).not.toBe(list[1].localId);
  });

  it('removeDraftBenefit 은 해당 localId 항목만 제거한다', () => {
    useCardStore.getState().addDraftBenefit({ title: 'A' });
    useCardStore.getState().addDraftBenefit({ title: 'B' });
    const [first] = useCardStore.getState().draftBenefits;
    useCardStore.getState().removeDraftBenefit(first.localId);
    const list = useCardStore.getState().draftBenefits;
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('B');
  });

  it('clearDraftBenefits 는 빈 배열로 리셋한다', () => {
    useCardStore.getState().addDraftBenefit({ title: 'A' });
    useCardStore.getState().clearDraftBenefits();
    expect(useCardStore.getState().draftBenefits).toEqual([]);
  });
});
