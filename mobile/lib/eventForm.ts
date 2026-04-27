// 이벤트 위저드 Step 2 — 기본 정보 검증 + 6개월 재참여 경고 계산
// DESIGN.md §8 흐름 / UI_STRUCTURE.md §8.2 wireframe 참고
export type EventInfoInput = {
  cardId: string | undefined;
  title: string;
  organizer: string | null;
  applyStart: string | null;
  applyEnd: string | null;
  useStart: string | null;
  useEnd: string | null;
  noPriorPaymentChecked: boolean;
};

export type EventInfoErrors = Partial<
  Record<
    'cardId' | 'title' | 'applyStart' | 'applyEnd' | 'useStart' | 'useEnd' | 'noPriorPaymentChecked',
    string
  >
>;

export function validateEventInfo(input: EventInfoInput): EventInfoErrors {
  const errors: EventInfoErrors = {};
  if (!input.cardId) errors.cardId = '카드를 선택하세요.';
  if (!input.title || input.title.trim().length === 0) errors.title = '이벤트명은 필수입니다.';

  if (input.applyStart && input.applyEnd && input.applyStart > input.applyEnd) {
    errors.applyEnd = '응모 기간 순서를 확인하세요.';
  }
  if (input.useStart && input.useEnd && input.useStart > input.useEnd) {
    errors.useEnd = '이용 기간 순서를 확인하세요.';
  }
  if (!input.noPriorPaymentChecked) {
    errors.noPriorPaymentChecked = '재참여 제한 항목을 확인하세요.';
  }
  return errors;
}

export type ReuseWarning = { monthsRemaining: number; message: string };

// 6개월 재참여 제한 — 마지막 이벤트 종료일 기준
export function computeReuseWarning(params: {
  lastEventAt: string | null;
  today: string;
}): ReuseWarning | null {
  if (!params.lastEventAt) return null;
  const last = new Date(params.lastEventAt + 'T00:00:00Z');
  const today = new Date(params.today + 'T00:00:00Z');
  const elapsedMonths =
    (today.getUTCFullYear() - last.getUTCFullYear()) * 12 +
    (today.getUTCMonth() - last.getUTCMonth()) -
    (today.getUTCDate() < last.getUTCDate() ? 1 : 0);
  const monthsRemaining = 6 - elapsedMonths;
  if (monthsRemaining <= 0) return null;
  return {
    monthsRemaining,
    message: `마지막 참여 종료 후 ${elapsedMonths}개월 — 아직 ${monthsRemaining}개월 더 대기 필요`,
  };
}
