// 이벤트 → 예정 알림 메타 계산 (순수 함수)
// design/SCHEMA.md §6 + design/DESIGN.md §10 스마트 기본값 매핑
import type { EventRow, NotificationKind, NotificationPreference } from '@/types/models';

export type PlannedNotification = {
  event_id: string;
  kind: NotificationKind;
  fire_at: string; // "YYYY-MM-DDTHH:MM:SS" (디바이스 로컬 타임존 가정)
  title: string;
  body: string;
};

// 종결 상태 — 알림 생성 불필요
const TERMINAL_STATUSES = new Set(['canceled', 'paid']);

// 날짜 문자열(YYYY-MM-DD)과 time_of_day를 합쳐 fire_at 문자열 생성
function combine(dateOnly: string, timeOfDay: string): string {
  const time = timeOfDay.length === 5 ? `${timeOfDay}:00` : timeOfDay;
  return `${dateOnly}T${time}`;
}

// 날짜 문자열에 deltaDays를 더한 날짜 문자열 반환 (UTC 기준)
function shiftDate(date: string, deltaDays: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

// use_start ~ use_end 범위에서 매월 15일·말일 날짜 목록 계산
function performanceCheckDates(useStart: string, useEnd: string): string[] {
  const start = new Date(`${useStart}T00:00:00Z`);
  const end = new Date(`${useEnd}T00:00:00Z`);
  const out: string[] = [];

  // 월 단위로 순회
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (cursor <= end) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth();
    const day15 = new Date(Date.UTC(year, month, 15));
    const lastDay = new Date(Date.UTC(year, month + 1, 0)); // 해당 월 말일
    for (const candidate of [day15, lastDay]) {
      if (candidate >= start && candidate <= end) {
        out.push(candidate.toISOString().slice(0, 10));
      }
    }
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return out;
}

/**
 * 이벤트 1건에 대한 예정 알림 목록 계산
 * - 종결 상태(canceled/paid) 또는 global_enabled=false 이면 빈 배열 반환
 * - kinds_enabled 필터 적용
 * - 관련 날짜가 null 이면 해당 종(kind) 생략
 */
export function buildEventNotifications(
  event: EventRow,
  prefs: NotificationPreference,
): PlannedNotification[] {
  if (!prefs.global_enabled) return [];
  if (TERMINAL_STATUSES.has(event.status)) return [];

  const kinds = prefs.kinds_enabled as Record<NotificationKind, boolean>;
  const time = prefs.time_of_day;
  const out: PlannedNotification[] = [];

  // 응모 마감 — apply_end 1일 전
  if (kinds.apply_deadline && event.apply_end) {
    out.push({
      event_id: event.id,
      kind: 'apply_deadline',
      fire_at: combine(shiftDate(event.apply_end, -1), time),
      title: '응모 마감 임박',
      body: `${event.title} — 내일까지 응모 가능`,
    });
  }

  // 실적 체크 — 이용 기간 내 매월 15일 + 말일
  if (kinds.performance_check && event.use_start && event.use_end) {
    for (const d of performanceCheckDates(event.use_start, event.use_end)) {
      out.push({
        event_id: event.id,
        kind: 'performance_check',
        fire_at: combine(d, time),
        title: '실적 체크',
        body: `${event.title} — 실적 진행 상황 확인`,
      });
    }
  }

  // 지급 예정 — payout_expected_at 7일 전
  if (kinds.payout_upcoming && event.payout_expected_at) {
    out.push({
      event_id: event.id,
      kind: 'payout_upcoming',
      fire_at: combine(shiftDate(event.payout_expected_at, -7), time),
      title: '지급 예정',
      body: `${event.title} — 7일 후 지급 예정`,
    });
  }

  // 해지 가능 — cancelable_from 1일 전
  if (kinds.cancel_available && event.cancelable_from) {
    out.push({
      event_id: event.id,
      kind: 'cancel_available',
      fire_at: combine(shiftDate(event.cancelable_from, -1), time),
      title: '해지 가능',
      body: `${event.title} — 내일부터 해지 가능`,
    });
  }

  return out;
}

/**
 * Expo 동시 64개 한도 우회 — 디바이스에 등록할 윈도우 (now ~ now+days일)
 * fire_at 이 now 이전이거나 horizon 이후인 항목을 제거
 */
export function withinWindow(
  list: PlannedNotification[],
  now: Date,
  days: number = 60,
): PlannedNotification[] {
  const horizon = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return list.filter((n) => {
    const t = new Date(n.fire_at);
    return t >= now && t <= horizon;
  });
}
