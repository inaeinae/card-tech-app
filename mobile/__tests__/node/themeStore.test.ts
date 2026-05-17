import { useThemeStore, THEME_MODE_KEY } from '@/stores/themeStore';

const mockGet = jest.fn();
const mockSet = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (k: string) => mockGet(k),
  setItemAsync: (k: string, v: string) => mockSet(k, v),
  deleteItemAsync: jest.fn(),
}));

beforeEach(() => {
  mockGet.mockReset();
  mockSet.mockReset();
  useThemeStore.setState({ mode: 'system', hydrated: false });
});

describe('themeStore', () => {
  it('초기 mode 는 system 이다', () => {
    expect(useThemeStore.getState().mode).toBe('system');
  });

  it('loadMode: SecureStore 에서 저장값을 읽어 set', async () => {
    mockGet.mockResolvedValueOnce('dark');
    await useThemeStore.getState().loadMode();
    expect(useThemeStore.getState().mode).toBe('dark');
    expect(useThemeStore.getState().hydrated).toBe(true);
  });

  it('loadMode: 잘못된 저장값은 무시하고 system 유지', async () => {
    mockGet.mockResolvedValueOnce('rainbow');
    await useThemeStore.getState().loadMode();
    expect(useThemeStore.getState().mode).toBe('system');
    expect(useThemeStore.getState().hydrated).toBe(true);
  });

  it('setMode: state 업데이트 + SecureStore 에 저장', async () => {
    await useThemeStore.getState().setMode('light');
    expect(useThemeStore.getState().mode).toBe('light');
    expect(mockSet).toHaveBeenCalledWith(THEME_MODE_KEY, 'light');
  });
});
