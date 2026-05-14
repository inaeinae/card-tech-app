// 도메인 모델 별칭 — DB 타입에서 파생
// SCHEMA.md 및 design/DESIGN.md §7 상태 머신 참고

import type { Database } from '@/lib/database.types';

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export type Profile = Row<'profiles'>;
export type Card = Row<'cards'>;
export type CardBenefit = Row<'card_benefits'>;
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
