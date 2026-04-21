import { signInWithDevEmail, signUpWithDevEmail } from '@/lib/devAuth';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(async ({ email }) => ({
        data: { user: { id: 'u1', email }, session: { access_token: 'a' } },
        error: null,
      })),
      signUp: jest.fn(async ({ email }) => ({
        data: { user: { id: 'u2', email }, session: { access_token: 'b' } },
        error: null,
      })),
    },
  },
}));

describe('devAuth', () => {
  const originalDev = (global as unknown as { __DEV__: boolean }).__DEV__;
  const originalUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  afterEach(() => {
    (global as unknown as { __DEV__: boolean }).__DEV__ = originalDev;
    process.env.EXPO_PUBLIC_SUPABASE_URL = originalUrl;
  });

  it('프로덕션 빌드에서는 호출 자체가 거부된다', async () => {
    (global as unknown as { __DEV__: boolean }).__DEV__ = false;
    await expect(signInWithDevEmail('a@b.c', 'x')).rejects.toThrow(/dev only/i);
  });

  it('원격 Supabase URL 이면 거부된다', async () => {
    (global as unknown as { __DEV__: boolean }).__DEV__ = true;
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://prod.supabase.co';
    await expect(signInWithDevEmail('a@b.c', 'x')).rejects.toThrow(/local.*only/i);
  });

  it('로컬 URL + __DEV__ 이면 signInWithPassword 호출', async () => {
    (global as unknown as { __DEV__: boolean }).__DEV__ = true;
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
    const result = await signInWithDevEmail('dev@local', 'pw');
    expect(result.user?.email).toBe('dev@local');
  });

  it('signUpWithDevEmail 동일 가드', async () => {
    (global as unknown as { __DEV__: boolean }).__DEV__ = false;
    await expect(signUpWithDevEmail('a@b.c', 'x')).rejects.toThrow(/dev only/i);
  });
});
