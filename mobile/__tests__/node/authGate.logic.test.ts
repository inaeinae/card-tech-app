jest.mock('@/stores/authStore', () => ({ useAuthStore: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: jest.fn(), useSegments: jest.fn() }));

import { decideAuthRoute } from '@/components/auth/AuthGate';

describe('decideAuthRoute', () => {
  it('초기화 중에는 null 반환 (라우팅 보류)', () => {
    expect(decideAuthRoute({ initializing: true, hasSession: false, inAuthGroup: false })).toBeNull();
  });

  it('세션 없음 + 탭 경로 → /(auth)/login', () => {
    expect(decideAuthRoute({ initializing: false, hasSession: false, inAuthGroup: false })).toBe(
      '/(auth)/login',
    );
  });

  it('세션 있음 + 인증 그룹 → /(tabs) 로 이동', () => {
    expect(decideAuthRoute({ initializing: false, hasSession: true, inAuthGroup: true })).toBe(
      '/(tabs)',
    );
  });

  it('세션 있음 + 탭 그룹 → null (유지)', () => {
    expect(decideAuthRoute({ initializing: false, hasSession: true, inAuthGroup: false })).toBeNull();
  });
});
