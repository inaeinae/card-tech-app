// useEventStore — Supabase 모킹 후 changeStatus / upsertEvent 동작 검증
const mockFrom = jest.fn();
const mockGetUser = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
    auth: { getUser: () => mockGetUser() },
  },
}));

import { useEventStore } from '@/stores/eventStore';

beforeEach(() => {
  mockFrom.mockReset();
  mockGetUser.mockReset();
  useEventStore.setState({ events: [], activeEvent: null, loading: false, error: null });
});

it('upsertEvent 신규(INSERT) 시 event_status_history 초기 행을 함께 insert', async () => {
  const inserted = {
    id: 'e1', status: 'registered', user_id: 'u1', card_id: 'c1', title: 't',
  };
  const eventsTable = {
    upsert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: inserted, error: null }),
      }),
    }),
  };
  const historyInsert = jest.fn().mockResolvedValue({ error: null });
  const historyTable = { insert: historyInsert };

  mockFrom.mockImplementation((table: string) => {
    if (table === 'events') return eventsTable;
    if (table === 'event_status_history') return historyTable;
    throw new Error(`unexpected table ${table}`);
  });

  await useEventStore.getState().upsertEvent({
    user_id: 'u1', card_id: 'c1', title: 't', status: 'registered',
  } as never);

  expect(historyInsert).toHaveBeenCalledWith(
    expect.objectContaining({
      event_id: 'e1', from_status: null, to_status: 'registered', is_auto: false, user_id: 'u1',
    }),
  );
});

it('upsertEvent 수정(id 있음) 시 history insert 호출 안 함', async () => {
  const updated = { id: 'e1', status: 'applied', user_id: 'u1', card_id: 'c1', title: 't' };
  const eventsTable = {
    upsert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: updated, error: null }),
      }),
    }),
  };
  const historyInsert = jest.fn();
  mockFrom.mockImplementation((table: string) => {
    if (table === 'events') return eventsTable;
    if (table === 'event_status_history') return { insert: historyInsert };
    throw new Error(`unexpected table ${table}`);
  });

  await useEventStore.getState().upsertEvent({
    id: 'e1', user_id: 'u1', card_id: 'c1', title: 't', status: 'applied',
  } as never);

  expect(historyInsert).not.toHaveBeenCalled();
});

it('upsertEvent INSERT 시 history insert 실패해도 이벤트 저장은 성공', async () => {
  const inserted = {
    id: 'e2', status: 'registered', user_id: 'u1', card_id: 'c1', title: 't',
  };
  const eventsTable = {
    upsert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: inserted, error: null }),
      }),
    }),
  };
  const historyInsert = jest.fn().mockResolvedValue({ error: { message: 'DB 오류' } });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'events') return eventsTable;
    if (table === 'event_status_history') return { insert: historyInsert };
    throw new Error(`unexpected table ${table}`);
  });

  // throw 없이 정상 반환돼야 함
  const result = await useEventStore.getState().upsertEvent({
    user_id: 'u1', card_id: 'c1', title: 't', status: 'registered',
  } as never);

  expect(result.id).toBe('e2');
  expect(useEventStore.getState().events).toHaveLength(1);
});

it('changeStatus 는 events.update 와 event_status_history.insert 를 모두 호출', async () => {
  useEventStore.setState({
    events: [
      {
        id: 'e1', user_id: 'u1', card_id: 'c1', title: 't',
        status: 'applied', status_updated_at: '2026-05-01T00:00:00Z',
      } as never,
    ],
  });
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });

  const updateEq = jest.fn().mockResolvedValue({ error: null });
  const eventsTable = { update: jest.fn().mockReturnValue({ eq: updateEq }) };
  const historyInsert = jest.fn().mockResolvedValue({ error: null });

  mockFrom.mockImplementation((table: string) => {
    if (table === 'events') return eventsTable;
    if (table === 'event_status_history') return { insert: historyInsert };
    throw new Error(`unexpected table ${table}`);
  });

  await useEventStore.getState().changeStatus('e1', 'in_progress', false);

  expect(eventsTable.update).toHaveBeenCalledWith(
    expect.objectContaining({ status: 'in_progress' }),
  );
  expect(historyInsert).toHaveBeenCalledWith(
    expect.objectContaining({
      event_id: 'e1', from_status: 'applied', to_status: 'in_progress',
      is_auto: false, user_id: 'u1',
    }),
  );
  expect(useEventStore.getState().events[0].status).toBe('in_progress');
});

it('loadEventBenefits — events 의 benefits 를 in 쿼리로 일괄 로드해 그룹핑', async () => {
  useEventStore.setState({
    events: [
      { id: 'e1', user_id: 'u1', card_id: 'c1', title: 't1', status: 'applied' } as never,
      { id: 'e2', user_id: 'u1', card_id: 'c1', title: 't2', status: 'paid' } as never,
    ],
    benefitsByEvent: {},
  });

  const benefitsRows = [
    { id: 'b1', event_id: 'e1', expected_amount: 5000 },
    { id: 'b2', event_id: 'e1', expected_amount: 3000 },
    { id: 'b3', event_id: 'e2', expected_amount: 10000 },
  ];

  const inMock = jest.fn().mockResolvedValue({ data: benefitsRows, error: null });
  const selectMock = jest.fn().mockReturnValue({ in: inMock });
  const benefitsTable = { select: selectMock };

  mockFrom.mockImplementation((table: string) => {
    if (table === 'benefits') return benefitsTable;
    throw new Error(`unexpected table ${table}`);
  });

  await useEventStore.getState().loadEventBenefits();

  expect(selectMock).toHaveBeenCalledWith('*');
  expect(inMock).toHaveBeenCalledWith('event_id', ['e1', 'e2']);
  const grouped = useEventStore.getState().benefitsByEvent;
  expect(grouped.e1).toHaveLength(2);
  expect(grouped.e2).toHaveLength(1);
  expect(grouped.e2[0].expected_amount).toBe(10000);
});

it('loadEventBenefits — events 가 비어 있으면 쿼리 호출 안 함', async () => {
  useEventStore.setState({ events: [], benefitsByEvent: {} });

  const selectMock = jest.fn();
  mockFrom.mockImplementation(() => ({ select: selectMock }));

  await useEventStore.getState().loadEventBenefits();

  expect(selectMock).not.toHaveBeenCalled();
  expect(useEventStore.getState().benefitsByEvent).toEqual({});
});
