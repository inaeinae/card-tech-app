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

// Phase 5.3 — 카드 상시혜택 카테고리 (이벤트 BenefitTemplate 와 별개 축)
export type BenefitCategory = { id: string; label: string };

export const BENEFIT_CATEGORIES: readonly BenefitCategory[] = [
  { id: 'life', label: '생활' },
  { id: 'digital_sub', label: '디지털구독' },
  { id: 'telecom', label: '통신' },
  { id: 'food', label: '푸드' },
  { id: 'easy_pay', label: '간편결제' },
  { id: 'overseas', label: '해외' },
  { id: 'select', label: '선택형' },
  { id: 'custom', label: '직접 입력' },
] as const;

export function getCategoryById(id: string): BenefitCategory | null {
  return BENEFIT_CATEGORIES.find((c) => c.id === id) ?? null;
}

// Phase 5.3 — 카드 카테고리별 추천 대상 구분(group_label) → 가맹점 시드 (사용자 편집 가능)
export type CategoryPresetGroup = { group_label: string; merchants: string };
export const CATEGORY_PRESETS: Record<string, CategoryPresetGroup[]> = {
  life: [
    { group_label: '생활잡화', merchants: '다이소' },
    { group_label: '공연', merchants: 'NOL 티켓' },
    { group_label: '서점', merchants: '알라딘' },
  ],
  digital_sub: [
    { group_label: '디지털콘텐츠', merchants: '넷플릭스, 디즈니+, 유튜브, 티빙' },
    { group_label: '멤버십', merchants: '쿠팡 와우 멤버십, 네이버플러스 멤버십' },
  ],
  telecom: [
    { group_label: '이동통신', merchants: 'SKT, KT, LG U+, 알뜰폰' },
    { group_label: '인터넷·유선', merchants: 'SK브로드밴드, KT, LG U+' },
  ],
  food: [
    { group_label: '음식점', merchants: '한식, 일식, 중식, 양식, 뷔페' },
    { group_label: '편의점', merchants: 'CU, GS25, 세븐일레븐, 이마트24' },
  ],
  easy_pay: [{ group_label: '간편결제', merchants: 'KB Pay' }],
  overseas: [{ group_label: '해외', merchants: '해외 가맹점 및 해외 직접구매' }],
};
