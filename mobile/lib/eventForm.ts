// 이벤트 위저드 Step 2 — 기본 정보 검증.
// 재참여 제한: v1 정책상 6개월 고정 규칙 폐기. 동일 카드사의 다른 카드에 active 이벤트가 있으면 단순 노티만.
export type EventInfoInput = {
  cardId: string | undefined;
  title: string;
  organizer: string | null;
  applyStart: string | null;
  applyEnd: string | null;
  useStart: string | null;
  useEnd: string | null;
};

export type EventInfoErrors = Partial<
  Record<'cardId' | 'title' | 'applyStart' | 'applyEnd' | 'useStart' | 'useEnd', string>
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
  return errors;
}

export type ReuseWarning = { count: number; message: string };

// 카드사 기준 active 이벤트 노티 — 같은 issuer의 다른 카드에서 진행 중인 이벤트가 있으면 단순 안내.
// 차단이 아닌 정보 제공 목적. 자기 자신 카드의 이벤트는 카운트 제외 (재등록 노이즈 방지).
const ACTIVE_STATUSES = new Set([
  'registered',
  'applied',
  'in_progress',
  'performance_done',
  'pending_payout',
  'cancelable',
]);

export function computeReuseWarning(params: {
  selectedCardId: string | undefined;
  cards: { id: string; issuer: string }[];
  events: { card_id: string; status: string }[];
}): ReuseWarning | null {
  if (!params.selectedCardId) return null;
  const selected = params.cards.find((c) => c.id === params.selectedCardId);
  if (!selected) return null;

  const otherCardIds = new Set(
    params.cards
      .filter((c) => c.issuer === selected.issuer && c.id !== selected.id)
      .map((c) => c.id),
  );
  if (otherCardIds.size === 0) return null;

  const count = params.events.filter(
    (e) => otherCardIds.has(e.card_id) && ACTIVE_STATUSES.has(e.status),
  ).length;
  if (count === 0) return null;

  return {
    count,
    message: `${selected.issuer}로 진행 중인 이벤트가 ${count}건 있습니다. 카드사 정책에 따라 중복 응모가 제한될 수 있습니다.`,
  };
}
