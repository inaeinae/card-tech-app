// 모든 풀스크린 라우트의 SafeArea + 기본 배경 + ScrollView 옵션 표준화.
// react-native-safe-area-context 기반 (RN 0.81+ 의 SafeAreaView from 'react-native' 는 deprecated).
import { ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Edges = ReadonlyArray<'top' | 'bottom' | 'left' | 'right'>;

type BaseProps = {
  children: ReactNode;
  edges?: Edges; // 기본: top + left + right (bottom 은 tab bar 뒤)
  bg?: 'bg' | 'surface'; // 기본 'bg'
  className?: string;
};

type ScreenProps =
  | (BaseProps & { scroll?: false; viewProps?: ViewProps })
  | (BaseProps & { scroll: true; scrollProps?: ScrollViewProps });

const DEFAULT_EDGES: Edges = ['top', 'left', 'right'];

export function SafeAreaScreen(props: ScreenProps) {
  const { children, edges = DEFAULT_EDGES, bg = 'bg', className } = props;
  const bgCls = bg === 'surface' ? 'bg-surface dark:bg-surface-dark' : 'bg-bg dark:bg-bg-dark';
  const cls = `flex-1 ${bgCls} ${className ?? ''}`.trim();

  if ('scroll' in props && props.scroll) {
    return (
      <SafeAreaView edges={edges} className={cls}>
        <ScrollView {...(props.scrollProps ?? {})}>{children}</ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView edges={edges} className={cls}>
      <View
        {...((props as BaseProps & { viewProps?: ViewProps }).viewProps ?? {})}
        className="flex-1"
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
