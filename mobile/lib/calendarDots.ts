// 캘린더 dot 색상/카테고리/milestone 추출 순수 함수
// design/UI_STRUCTURE.md §2.5 컬러 규칙과 1:1 매핑
import type { EventRow, EventStatus } from '@/types/models';

export type DotCategory = '응모' | '이용' | '지급' | '해지' | '경고';
export type DateString = string; // YYYY-MM-DD

// 디자인 토큰 값(Colors.light.*) 과 동일 — UI에서 토큰 import 후 매핑 권장
export const DOT_COLOR: Record<DotCategory, string> = {
  응모: '#3182F6', // $primary
  이용: '#F59E0B', // $warning
  지급: '#19D294', // $accent
  해지: '#8B95A1', // $ink-3
  경고: '#FF4D4F', // $danger
};

// 상태 → dot 카테고리 매핑
export function statusToDotCategory(status: EventStatus): DotCategory {
  if (status === 'registered' || status === 'applied') return '응모';
  if (status === 'in_progress') return '이용';
  if (status === 'performance_done' || status === 'pending_payout' || status === 'paid')
    return '지급';
  if (status === 'canceled') return '해지';
  return '경고'; // cancelable
}

// 이벤트 milestone 일자 — 정의된 필드만 추출, YYYY-MM-DD 로 정규화
export function extractMilestoneDates(e: EventRow): DateString[] {
  const fields = [
    e.apply_start,
    e.apply_end,
    e.use_start,
    e.use_end,
    e.payout_expected_at,
    e.cancelable_from,
  ];
  return fields.filter((v): v is string => !!v).map((v) => v.slice(0, 10));
}

// 일자별 이벤트 그룹 — agenda 뷰/markedDates 양쪽에서 사용
export function groupEventsByDate(events: EventRow[]): Record<DateString, EventRow[]> {
  const map: Record<DateString, EventRow[]> = {};
  for (const e of events) {
    const dates = new Set(extractMilestoneDates(e));
    for (const d of dates) {
      if (!map[d]) map[d] = [];
      map[d].push(e);
    }
  }
  return map;
}
