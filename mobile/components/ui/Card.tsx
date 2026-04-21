// 일반 카드 컨테이너 — 탭 가능 · 키보드 포커스 표현
import { Pressable, View } from 'react-native';
import type { PressableProps, ViewProps } from 'react-native';

type StaticProps = ViewProps & { children: React.ReactNode };
type PressableCardProps = Omit<PressableProps, 'style'> & { children: React.ReactNode };

export function Card({ children, className, ...rest }: StaticProps & { className?: string }) {
  return (
    <View
      className={`rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 ${className ?? ''}`}
      {...rest}
    >
      {children}
    </View>
  );
}

export function PressableCard({
  children,
  accessibilityLabel,
  ...rest
}: PressableCardProps & { className?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
      className="rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 active:opacity-80"
      {...rest}
    >
      {children}
    </Pressable>
  );
}
