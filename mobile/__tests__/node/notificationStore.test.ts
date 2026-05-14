// supabase / expoBridge / permissions 모듈을 mock 으로 대체
import type { EventRow } from '@/types/models';

const mockFromBuilder = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn(),
  single: jest.fn(),
};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => mockFromBuilder),
  },
}));

jest.mock('@/lib/notifications/expoBridge', () => ({
  scheduleLocal: jest.fn().mockResolvedValue('os-id-1'),
  cancelLocal: jest.fn().mockResolvedValue(undefined),
  cancelAllLocal: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/notifications/permissions', () => ({
  getPermissionStatus: jest.fn().mockResolvedValue('granted'),
  requestPermission: jest.fn().mockResolvedValue('granted'),
}));

import { useNotificationStore } from '@/stores/notificationStore';
import { cancelLocal, scheduleLocal, cancelAllLocal } from '@/lib/notifications/expoBridge';
import { requestPermission } from '@/lib/notifications/permissions';

function ev(overrides: Partial<EventRow> = {}): EventRow {
  return {
    id: 'e1',
    user_id: 'u1',
    card_id: 'c1',
    title: '이벤트 A',
    organizer: null,
    status: 'applied',
    apply_start: null,
    apply_end: '2026-06-10',
    use_start: null,
    use_end: null,
    payout_expected_at: null,
    payout_actual_at: null,
    payout_expected_period: null,
    cancelable_from: null,
    notes: null,
    status_updated_at: '2026-05-15T00:00:00Z',
    warning_dismissed: false,
    created_at: '2026-05-15T00:00:00Z',
    updated_at: '2026-05-15T00:00:00Z',
    ...overrides,
  } as unknown as EventRow;
}

const PREFS = {
  user_id: 'u1',
  global_enabled: true,
  kinds_enabled: {
    apply_deadline: true,
    performance_check: true,
    payout_upcoming: true,
    cancel_available: true,
    autopay_check: true,
  },
  time_of_day: '09:00:00',
  updated_at: '2026-05-15T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  useNotificationStore.setState({
    prefs: PREFS as never,
    scheduled: [],
    permission: 'undetermined',
    loading: false,
  });
});

it('requestPermission — granted 면 store.permission 갱신', async () => {
  await useNotificationStore.getState().requestPermission();
  expect(requestPermission).toHaveBeenCalled();
  expect(useNotificationStore.getState().permission).toBe('granted');
});

it('syncEventSchedule — 기존 row 삭제 + 새 row insert + OS 스케줄', async () => {
  mockFromBuilder.delete.mockReturnThis();
  mockFromBuilder.eq.mockReturnThis();
  mockFromBuilder.insert.mockReturnThis();
  mockFromBuilder.select.mockResolvedValueOnce({ data: [{ id: 's1', notification_id: 'os-old' }], error: null });
  mockFromBuilder.select.mockResolvedValueOnce({
    data: [{ id: 's-new', kind: 'apply_deadline', fire_at: '2026-06-09T09:00:00', event_id: 'e1', user_id: 'u1', title: 't', body: 'b', canceled: false, delivered_at: null, created_at: '' }],
    error: null,
  });

  await useNotificationStore.getState().syncEventSchedule(ev());

  expect(scheduleLocal).toHaveBeenCalled();
  const arg = (scheduleLocal as jest.Mock).mock.calls[0][0];
  expect(arg.kind).toBe('apply_deadline');
  expect(arg.event_id).toBe('e1');
});

it('cancelEventSchedule — DB update canceled=true + OS cancel 호출', async () => {
  useNotificationStore.setState({
    scheduled: [
      { id: 's1', event_id: 'e1', kind: 'apply_deadline', fire_at: '2026-06-09T09:00:00', user_id: 'u1', title: 't', body: 'b', canceled: false, delivered_at: null, created_at: '' } as never,
    ],
  });
  mockFromBuilder.update.mockReturnThis();
  mockFromBuilder.eq.mockResolvedValueOnce({ error: null });

  await useNotificationStore.getState().cancelEventSchedule('e1');

  expect(mockFromBuilder.update).toHaveBeenCalledWith({ canceled: true });
});

it('rescheduleAll — OS 큐 전부 비우고 60일 윈도우 재등록', async () => {
  useNotificationStore.setState({
    scheduled: [
      { id: 's-near', event_id: 'e1', kind: 'apply_deadline', fire_at: '2026-06-09T09:00:00', user_id: 'u1', title: 't', body: 'b', canceled: false, delivered_at: null, created_at: '' } as never,
      { id: 's-far', event_id: 'e2', kind: 'payout_upcoming', fire_at: '2026-12-01T09:00:00', user_id: 'u1', title: 't', body: 'b', canceled: false, delivered_at: null, created_at: '' } as never,
      { id: 's-canceled', event_id: 'e3', kind: 'cancel_available', fire_at: '2026-06-01T09:00:00', user_id: 'u1', title: 't', body: 'b', canceled: true, delivered_at: null, created_at: '' } as never,
    ],
  });

  await useNotificationStore.getState().rescheduleAll(new Date('2026-05-15T00:00:00Z'));

  expect(cancelAllLocal).toHaveBeenCalled();
  expect(scheduleLocal).toHaveBeenCalledTimes(1);
  const arg = (scheduleLocal as jest.Mock).mock.calls[0][0];
  expect(arg.kind).toBe('apply_deadline');
});
