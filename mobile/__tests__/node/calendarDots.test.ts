import { DOT_COLOR, statusToDotCategory } from '@/lib/calendarDots';

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
