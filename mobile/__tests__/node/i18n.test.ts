import { t, LOCALE } from '@/lib/i18n';

describe('i18n', () => {
  it('LOCALE 은 v1 에서 ko 고정', () => {
    expect(LOCALE).toBe('ko');
  });

  it('등록된 키를 한글 문구로 반환', () => {
    expect(t('common.retry')).toBe('다시 시도');
    expect(t('errors.generic')).toBe('문제가 발생했어요');
  });

  it('{token} 보간', () => {
    expect(t('card.benefitCount', { count: 3 })).toBe('혜택 3개');
  });

  it('값 없는 토큰은 원형 유지', () => {
    expect(t('card.benefitCount')).toBe('혜택 {count}개');
  });

  it('미존재 키는 키 자체 반환', () => {
    expect(t('nope.missing')).toBe('nope.missing');
  });
});
