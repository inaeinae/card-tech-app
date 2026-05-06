import type { EventStatus } from '@/types/models';

const DOT_COLOR: Record<string, string> = {
  응모: '#3182F6',
  이용: '#F59E0B',
  지급: '#19D294',
  해지: '#8B95A1',
  경고: '#FF4D4F',
};

function statusToDotCategory(status: EventStatus): keyof typeof DOT_COLOR {
  if (['registered', 'applied'].includes(status)) return '응모';
  if (status === 'in_progress') return '이용';
  if (['performance_done', 'pending_payout', 'paid'].includes(status)) return '지급';
  if (status === 'canceled') return '해지';
  return '경고';
}

it('applied → 응모 dot (파랑)', () => {
  expect(DOT_COLOR[statusToDotCategory('applied')]).toBe('#3182F6');
});
it('in_progress → 이용 dot (주황)', () => {
  expect(DOT_COLOR[statusToDotCategory('in_progress')]).toBe('#F59E0B');
});
it('paid → 지급 dot (초록)', () => {
  expect(DOT_COLOR[statusToDotCategory('paid')]).toBe('#19D294');
});
it('canceled → 해지 dot (회색)', () => {
  expect(DOT_COLOR[statusToDotCategory('canceled')]).toBe('#8B95A1');
});
it('cancelable → 경고 dot (빨강)', () => {
  expect(DOT_COLOR[statusToDotCategory('cancelable')]).toBe('#FF4D4F');
});
