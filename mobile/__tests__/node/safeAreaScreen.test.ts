import { createElement, isValidElement, type ReactElement } from 'react';

// react-native-safe-area-context 는 RN-only — 노드 환경에서는 표식용 더미 컴포넌트로 모킹
jest.mock('react-native-safe-area-context', () => {
  const SafeAreaView = function SafeAreaView() {
    return null;
  };
  return { SafeAreaView, SafeAreaProvider: SafeAreaView };
});

// ScrollView/View 도 식별 가능한 더미로 — react-native 의 host 컴포넌트는 node 에서 null 렌더 → 직접 비교 어려움
jest.mock('react-native', () => {
  const ScrollView = function ScrollView() {
    return null;
  };
  const View = function View() {
    return null;
  };
  const Text = function Text() {
    return null;
  };
  return { ScrollView, View, Text };
});

import { SafeAreaScreen } from '../../components/ui/SafeAreaScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text } from 'react-native';

// SafeAreaScreen 은 함수형 컴포넌트 — 직접 호출하여 반환된 React 엘리먼트 트리를 검사한다
type AnyEl = ReactElement<{ className?: string; children?: unknown }>;
const child = createElement(Text, null, 'x');

const renderRoot = (props: Parameters<typeof SafeAreaScreen>[0]): AnyEl =>
  SafeAreaScreen(props) as AnyEl;

describe('SafeAreaScreen', () => {
  test('기본 — bg-bg 클래스', () => {
    const root = renderRoot({ children: child });
    expect(root.type).toBe(SafeAreaView);
    expect(root.props.className).toContain('bg-bg');
    expect(root.props.className).toContain('dark:bg-bg-dark');
  });

  test('bg="surface" — bg-surface 클래스', () => {
    const root = renderRoot({ bg: 'surface', children: child });
    expect(root.type).toBe(SafeAreaView);
    expect(root.props.className).toContain('bg-surface');
    expect(root.props.className).toContain('dark:bg-surface-dark');
  });

  test('scroll=true — ScrollView 자식', () => {
    const root = renderRoot({ scroll: true, children: child });
    const inner = root.props.children;
    expect(isValidElement(inner)).toBe(true);
    expect((inner as ReactElement).type).toBe(ScrollView);
  });

  test('scroll 미지정 — View 자식', () => {
    const root = renderRoot({ children: child });
    const inner = root.props.children;
    expect(isValidElement(inner)).toBe(true);
    expect((inner as ReactElement).type).toBe(View);
  });
});
