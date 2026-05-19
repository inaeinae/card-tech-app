// 도메인 모델 별칭 — DB 타입에서 파생
// SCHEMA.md 및 design/DESIGN.md §7 상태 머신 참고

import type { Database } from '@/lib/database.types';

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export type Profile = Row<'profiles'>;
// Card: 생성된 Row 타입에서 card_type 을 좁힌 union 으로 override (Phase 5.3)
export type Card = Omit<Row<'cards'>, 'card_type'> & {
  card_type: CardType | null;
};
// CardBenefit: discount_method union override + targets/cap_tiers 관계 (Phase 5.3)
export type CardBenefit = Omit<Row<'card_benefits'>, 'discount_method'> & {
  discount_method: DiscountMethod | null;
  targets: CardBenefitTarget[];
  cap_tiers: CardBenefitCapTier[];
};
export type EventRow = Row<'events'>;
export type Benefit = Row<'benefits'>;
export type EventStatusHistory = Row<'event_status_history'>;
export type NotificationPreference = Row<'notification_preferences'>;
export type ScheduledNotification = Row<'scheduled_notifications'>;

export type EventStatus = Database['public']['Enums']['event_status'];
export type BenefitType = Database['public']['Enums']['benefit_type'];
export type NotificationKind = Database['public']['Enums']['notification_kind'];

// 상태 배지에 쓰는 고정 순서 — design/UI_STRUCTURE.md §3 참고
export const EVENT_STATUS_ORDER: readonly EventStatus[] = [
  'registered',
  'applied',
  'in_progress',
  'performance_done',
  'pending_payout',
  'paid',
  'cancelable',
  'canceled',
];

// 상태별 한글 라벨 (VoiceOver/배지 텍스트 공통)
export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  registered: '등록',
  applied: '응모완료',
  in_progress: '실적달성중',
  performance_done: '실적완료',
  pending_payout: '지급대기',
  paid: '지급완료',
  cancelable: '해지가능',
  canceled: '해지완료',
};

// 알림 종류별 on/off — notification_preferences.kinds_enabled JSONB 의 정형 타입
export type KindsEnabled = Record<NotificationKind, boolean>;

export const DEFAULT_KINDS_ENABLED: KindsEnabled = {
  apply_deadline: true,
  performance_check: true,
  payout_upcoming: true,
  cancel_available: true,
  autopay_check: true,
};

// Phase 5.3 — 카드 메타 / 정규화 혜택 모델
// 카드 사용처 구분 (국내전용 / 해외겸용)
export type CardType = 'domestic' | 'overseas';

// 혜택 할인 방식 (결제일 할인 / 바로 할인 / 캐시백 / 포인트 적립 / 기타)
export type DiscountMethod = 'bill_discount' | 'instant_discount' | 'cashback' | 'point' | 'other';

// 할인 방식 한글 라벨 (UI 표기 공통)
export const DISCOUNT_METHOD_LABEL: Record<DiscountMethod, string> = {
  bill_discount: '결제일 할인',
  instant_discount: '바로 할인',
  cashback: '캐시백',
  point: '포인트 적립',
  other: '기타',
};

// 카드 타입 한글 라벨 (UI 표기 공통)
export const CARD_TYPE_LABEL: Record<CardType, string> = {
  domestic: '국내전용',
  overseas: '해외겸용',
};

// 혜택 대상 가맹점 그룹 (card_benefit_targets 행)
export type CardBenefitTarget = {
  id: string;
  group_label: string;
  merchants: string;
  sort_order: number;
};

// 혜택 실적 구간별 한도 (card_benefit_cap_tiers 행)
export type CardBenefitCapTier = {
  id: string;
  min_spend_won: number;
  cap_won: number;
  sort_order: number;
};
