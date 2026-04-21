// 범용 배지 — 배경색 + 텍스트 병기 (color-not-only 규칙)
import { Text, View } from 'react-native';

type BadgeTone = 'neutral' | 'primary' | 'accent' | 'warning' | 'danger';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  // 점 형태 표시 (리스트 아이템 인라인용)
  dot?: boolean;
};

const toneClass: Record<BadgeTone, string> = {
  neutral: 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark',
  primary: 'bg-primary/10 dark:bg-primary-dark/20 border-primary dark:border-primary-dark',
  accent: 'bg-accent/10 dark:bg-accent-dark/20 border-accent dark:border-accent-dark',
  warning: 'bg-amber-500/10 border-amber-500',
  danger: 'bg-destructive/10 dark:bg-destructive-dark/20 border-destructive dark:border-destructive-dark',
};

const toneTextClass: Record<BadgeTone, string> = {
  neutral: 'text-foreground dark:text-foreground-dark',
  primary: 'text-primary dark:text-primary-dark',
  accent: 'text-accent dark:text-accent-dark',
  warning: 'text-amber-700 dark:text-amber-300',
  danger: 'text-destructive dark:text-destructive-dark',
};

export function Badge({ label, tone = 'neutral', dot = false }: BadgeProps) {
  return (
    <View
      className={`self-start flex-row items-center gap-1.5 rounded-xs border px-2 py-1 ${toneClass[tone]}`}
      accessibilityLabel={label}
    >
      {dot ? <View className={`h-1.5 w-1.5 rounded-full ${dotBg(tone)}`} /> : null}
      <Text className={`text-caption font-medium ${toneTextClass[tone]}`}>{label}</Text>
    </View>
  );
}

function dotBg(tone: BadgeTone): string {
  return {
    neutral: 'bg-muted dark:bg-muted-dark',
    primary: 'bg-primary dark:bg-primary-dark',
    accent: 'bg-accent dark:bg-accent-dark',
    warning: 'bg-amber-500',
    danger: 'bg-destructive dark:bg-destructive-dark',
  }[tone];
}
