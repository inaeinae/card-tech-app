import { buildCardImagePath, getCardImageContentType } from '@/lib/cardImage';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(async () => ({ error: null })),
        createSignedUrl: jest.fn(async () => ({
          data: { signedUrl: 'https://example.com/signed' },
          error: null,
        })),
      })),
    },
  },
}));

describe('cardImage path', () => {
  it('user_id/card_id/filename.jpg 형식으로 경로를 만든다', () => {
    const path = buildCardImagePath({
      userId: '11111111-1111-1111-1111-111111111111',
      cardId: '22222222-2222-2222-2222-222222222222',
      extension: 'jpg',
    });
    expect(path).toBe(
      '11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/card.jpg',
    );
  });

  it('jpg 외 확장자는 거부한다 (RLS 경로 규칙 보호)', () => {
    expect(() =>
      buildCardImagePath({ userId: 'a', cardId: 'b', extension: 'exe' as 'jpg' }),
    ).toThrow(/extension/i);
  });
});

describe('cardImage content-type', () => {
  it('jpg → image/jpeg', () => {
    expect(getCardImageContentType('jpg')).toBe('image/jpeg');
  });

  it('png → image/png', () => {
    expect(getCardImageContentType('png')).toBe('image/png');
  });
});
