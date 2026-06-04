// i18n 기반 스캐폴딩 — v1 은 ko 고정. 구조만 마련해 v2 다국어 확장 시 사전만 추가.
//
// 사용:
//   import { t } from '@/lib/i18n';
//   t('common.retry')                         // '다시 시도'
//   t('errors.generic')                        // 공통 에러 문구
//   t('card.benefitCount', { count: 3 })       // '혜택 3개'
//
// 원칙:
// - 화면 문구를 점진적으로 이 사전으로 이관 (현재는 인라인 한글이 다수, 강제 이관 X).
// - 키는 `네임스페이스.키` 점 표기. 보간은 {name} 토큰.

export type Locale = 'ko';

// v1 기본 로케일 — 고정. v2 에서 SecureStore/OS locale 연동.
export const LOCALE: Locale = 'ko';

// 중첩 사전. 새 문구는 적절한 네임스페이스에 추가.
const messages: Record<Locale, Record<string, string>> = {
  ko: {
    'common.confirm': '확인',
    'common.cancel': '취소',
    'common.save': '저장',
    'common.delete': '삭제',
    'common.edit': '수정',
    'common.retry': '다시 시도',
    'common.close': '닫기',
    'common.loading': '불러오는 중',

    'errors.generic': '문제가 발생했어요',
    'errors.network': '네트워크 연결을 확인해 주세요',
    'errors.boundary': '앱에 문제가 발생했어요. 잠시 후 다시 시도해 주세요.',

    'card.benefitCount': '혜택 {count}개',
    'event.statusChange': '상태 변경',

    'a11y.back': '뒤로 가기',
    'a11y.notifications': '알림',
    'a11y.addEvent': '이벤트 등록',
    'a11y.settings': '설정',
  },
};

// {token} 보간. 값이 없으면 토큰 원형 유지.
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in params ? String(params[key]) : match,
  );
}

// 번역 조회. 키 미존재 시 키 자체를 반환(개발 중 누락 가시화).
export function t(key: string, params?: Record<string, string | number>): string {
  const dict = messages[LOCALE];
  const template = dict[key];
  if (template === undefined) {
    if (__DEV__) console.warn(`[i18n] 누락된 키: ${key}`);
    return key;
  }
  return interpolate(template, params);
}
