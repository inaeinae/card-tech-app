import { useProfileStore } from '@/stores/profileStore';

const mockSelectSingle = jest.fn();
const mockUpsert = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: { id: 'u1' } }, error: null }),
      ),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ single: mockSelectSingle })),
      })),
      upsert: mockUpsert,
    })),
  },
}));

beforeEach(() => {
  mockSelectSingle.mockReset();
  mockUpsert.mockReset();
  useProfileStore.setState({ profile: null, loading: false });
});

describe('profileStore', () => {
  it('loadProfile: profiles 테이블에서 현재 유저 row 를 가져와 state 에 저장한다', async () => {
    mockSelectSingle.mockResolvedValueOnce({
      data: { id: 'u1', nickname: '인애', notify_enabled: true, notify_time_of_day: '09:00:00', preferred_issuer: null, created_at: '', updated_at: '' },
      error: null,
    });
    await useProfileStore.getState().loadProfile();
    expect(useProfileStore.getState().profile?.nickname).toBe('인애');
  });

  it('loadProfile: row 없음(PGRST116) 이면 profile=null 로 둔다', async () => {
    mockSelectSingle.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116', message: 'no rows' },
    });
    await useProfileStore.getState().loadProfile();
    expect(useProfileStore.getState().profile).toBeNull();
  });

  it('upsertNickname: profiles 에 upsert 호출 후 state.profile.nickname 갱신', async () => {
    useProfileStore.setState({
      profile: { id: 'u1', nickname: '이전', notify_enabled: true, notify_time_of_day: '09:00:00', preferred_issuer: null, created_at: '', updated_at: '' } as never,
      loading: false,
    });
    mockUpsert.mockResolvedValueOnce({ error: null });
    await useProfileStore.getState().upsertNickname('새닉네임');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', nickname: '새닉네임' }),
      expect.any(Object),
    );
    expect(useProfileStore.getState().profile?.nickname).toBe('새닉네임');
  });

  it('upsertNickname: 공백만 입력하면 오류를 throw', async () => {
    await expect(useProfileStore.getState().upsertNickname('   ')).rejects.toThrow(
      /닉네임/,
    );
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('reset: profile=null 로 초기화', () => {
    useProfileStore.setState({ profile: { id: 'u1', nickname: 'x' } as never, loading: false });
    useProfileStore.getState().reset();
    expect(useProfileStore.getState().profile).toBeNull();
  });
});
