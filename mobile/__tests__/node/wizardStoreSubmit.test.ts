const mockEventsUpsert = jest.fn();
const mockEventsSelectSingle = jest.fn();
const mockBenefitsInsert = jest.fn();
const mockBenefitsDelete = jest.fn();
const mockHistoryInsert = jest.fn();
const mockCardsUpdate = jest.fn();
const mockBenefitsLoad = jest.fn();
const mockEventsLoad = jest.fn();
const mockGetUser = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: () => mockGetUser() },
    from: (table: string) => {
      switch (table) {
        case 'events':
          return {
            upsert: (payload: unknown) => {
              mockEventsUpsert(payload);
              return {
                select: () => ({ single: () => mockEventsSelectSingle() }),
              };
            },
            select: () => ({ eq: () => ({ single: () => mockEventsLoad() }) }),
          };
        case 'benefits':
          return {
            insert: (rows: unknown) => {
              mockBenefitsInsert(rows);
              return Promise.resolve({ error: null });
            },
            delete: () => ({
              eq: () => {
                mockBenefitsDelete();
                return Promise.resolve({ error: null });
              },
            }),
            select: () => ({ eq: () => ({ order: () => mockBenefitsLoad() }) }),
          };
        case 'event_status_history':
          return {
            insert: (row: unknown) => {
              mockHistoryInsert(row);
              return Promise.resolve({ error: null });
            },
          };
        case 'cards':
          return {
            update: (patch: unknown) => {
              mockCardsUpdate(patch);
              return { eq: () => Promise.resolve({ error: null }) };
            },
          };
        default:
          throw new Error(`unexpected table ${table}`);
      }
    },
  },
}));

import { useWizardStore } from '@/stores/wizardStore';

describe('wizardStore.submit (create)', () => {
  beforeEach(() => {
    mockEventsUpsert.mockReset();
    mockEventsSelectSingle.mockReset();
    mockBenefitsInsert.mockReset();
    mockBenefitsDelete.mockReset();
    mockHistoryInsert.mockReset();
    mockCardsUpdate.mockReset();
    mockGetUser.mockReset();
    useWizardStore.getState().reset();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
  });

  it('events upsert + benefits insert + history insert (registered)', async () => {
    mockEventsSelectSingle.mockResolvedValue({
      data: { id: 'e1', user_id: 'u1', card_id: 'c1', status: 'registered', use_end: '2026-03-31' },
      error: null,
    });

    useWizardStore.getState().patchDraft({
      cardId: 'c1',
      title: 'BC ZONE',
      organizer: '카카오페이',
      applyStart: '2026-02-01',
      applyEnd: '2026-02-28',
      useStart: '2026-02-01',
      useEnd: '2026-03-31',
    });
    useWizardStore.getState().addBenefit({
      templateId: 'cashback',
      type: 'cashback',
      label: '25만원 페이백',
      expectedAmount: 170000,
    });

    const { eventId } = await useWizardStore.getState().submit({});

    expect(eventId).toBe('e1');
    expect(mockEventsUpsert).toHaveBeenCalledTimes(1);
    expect(mockBenefitsInsert).toHaveBeenCalledTimes(1);
    expect(mockBenefitsInsert.mock.calls[0][0]).toEqual([
      expect.objectContaining({ event_id: 'e1', user_id: 'u1', expected_amount: 170000 }),
    ]);
    expect(mockHistoryInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_id: 'e1',
        user_id: 'u1',
        from_status: null,
        to_status: 'registered',
        is_auto: false,
      }),
    );
    expect(mockCardsUpdate).toHaveBeenCalledWith({ last_event_at: '2026-03-31' });
  });
});

describe('wizardStore.submit (update)', () => {
  beforeEach(() => {
    mockEventsUpsert.mockReset();
    mockEventsSelectSingle.mockReset();
    mockBenefitsInsert.mockReset();
    mockBenefitsDelete.mockReset();
    mockHistoryInsert.mockReset();
    mockCardsUpdate.mockReset();
    mockGetUser.mockReset();
    useWizardStore.getState().reset();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
  });

  it('eventId 를 넘기면 benefits 를 delete 후 insert (replace)', async () => {
    mockEventsSelectSingle.mockResolvedValue({
      data: { id: 'e1', user_id: 'u1', card_id: 'c1', status: 'registered', use_end: null },
      error: null,
    });

    useWizardStore.getState().patchDraft({
      cardId: 'c1',
      title: 'updated',
      applyStart: undefined,
      applyEnd: undefined,
      useStart: undefined,
      useEnd: undefined,
    });
    useWizardStore.getState().addBenefit({
      templateId: 'cashback',
      type: 'cashback',
      label: 'b1',
      expectedAmount: 1000,
    });

    await useWizardStore.getState().submit({ eventId: 'e1' });

    expect(mockBenefitsDelete).toHaveBeenCalledTimes(1);
    expect(mockBenefitsInsert).toHaveBeenCalledTimes(1);
    expect(mockHistoryInsert).not.toHaveBeenCalled();
  });
});
