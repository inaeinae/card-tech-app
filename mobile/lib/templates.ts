// 혜택 입력 위저드 템플릿 — DESIGN.md §8 / 부록 A.3 ~ A.5 참고
import type { BenefitType } from '@/types/models';

export type SubItemPreset = {
  label: string;
  defaultAmount?: number;
};

export type BenefitTemplate = {
  id: string;
  label: string;
  type: BenefitType;
  defaultTitle?: string;
  defaultExpectedAmount?: number;
  supportsSubItems: boolean;
  presetSubItems?: SubItemPreset[];
  isEventOnly?: boolean; // true이면 context=card 에서 숨김
};

export const BENEFIT_TEMPLATES: readonly BenefitTemplate[] = [
  {
    id: 'cashback',
    label: '캐시백 / 페이백',
    type: 'cashback',
    defaultTitle: '이용 금액 캐시백',
    supportsSubItems: false,
  },
  {
    id: 'discount',
    label: '청구할인',
    type: 'discount',
    defaultTitle: '청구할인',
    supportsSubItems: false,
  },
  {
    id: 'payback',
    label: '페이백 머니 적립',
    type: 'payback',
    defaultTitle: '페이백 적립',
    supportsSubItems: false,
  },
  {
    id: 'autopay',
    label: '자동납부 할인',
    type: 'discount',
    defaultTitle: '생활비 자동납부 할인',
    supportsSubItems: true,
    isEventOnly: true, // 기간·이벤트 기반 — 카드 상시혜택 컨텍스트에서 숨김
    presetSubItems: [
      { label: '아파트 관리비', defaultAmount: 5000 },
      { label: '도시가스', defaultAmount: 5000 },
      { label: '전기요금', defaultAmount: 5000 },
      { label: '4대보험', defaultAmount: 5000 },
      { label: '학부모부담금', defaultAmount: 5000 },
      { label: '통신요금(KT)', defaultAmount: 5000 },
      { label: '사립유치원', defaultAmount: 5000 },
    ],
  },
  {
    id: 'overseas',
    label: '해외 사용 적립',
    type: 'payback',
    defaultTitle: '해외 가맹점 적립',
    supportsSubItems: false,
  },
  {
    id: 'revolving',
    label: '리볼빙 가입 리워드',
    type: 'payback',
    defaultTitle: '리볼빙 신규 가입 리워드',
    supportsSubItems: false,
  },
  {
    id: 'family-card',
    label: '가족카드 사용 리워드',
    type: 'payback',
    defaultTitle: '가족카드 이용 리워드',
    supportsSubItems: false,
  },
  {
    id: 'extra-spend',
    label: '추가 사용 조건',
    type: 'payback',
    defaultTitle: '월 추가 사용 리워드',
    supportsSubItems: false,
  },
  {
    id: 'custom',
    label: '커스텀',
    type: 'cashback',
    supportsSubItems: false,
  },
] as const;

export function getTemplateById(id: string): BenefitTemplate | null {
  return BENEFIT_TEMPLATES.find((t) => t.id === id) ?? null;
}
