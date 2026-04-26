const mockSetSession = jest.fn(async (_args: unknown) => ({ error: null }));
const mockInvoke = jest.fn(async (_name: string, _opts: unknown) => ({
  data: { access_token: 'at', refresh_token: 'rt' },
  error: null,
}));
const mockKakaoLogin = jest.fn(async () => ({ accessToken: 'kakao-at' }));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      setSession: (args: unknown) => mockSetSession(args),
      getSession: jest.fn(async () => ({ data: { session: null } })),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(async () => ({ error: null })),
    },
    functions: { invoke: (name: string, opts: unknown) => mockInvoke(name, opts) },
  },
}));

jest.mock('@react-native-seoul/kakao-login', () => ({
  login: () => mockKakaoLogin(),
}));

import { useAuthStore } from '@/stores/authStore';

describe('authStore.signInWithKakaoNative', () => {
  beforeEach(() => {
    mockSetSession.mockClear();
    mockInvoke.mockClear();
    mockKakaoLogin.mockClear();
  });

  it('SDK 로그인 → Edge Function → setSession 흐름', async () => {
    await useAuthStore.getState().signInWithKakaoNative();
    expect(mockKakaoLogin).toHaveBeenCalled();
    expect(mockInvoke).toHaveBeenCalledWith(
      'kakao-oauth',
      expect.objectContaining({ body: { access_token: 'kakao-at' } }),
    );
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'at',
      refresh_token: 'rt',
    });
  });
});
