// 카테고리 칩 / 셀 배지 공용 — NativeWind 토큰
import { Pressable, Text, View } from 'react-native';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'default' | 'overseas';
  size?: 'sm' | 'md';
};

export function Chip({ label, selected, onPress, tone = 'default', size = 'md' }: ChipProps) {
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';
  const textSize = size === 'sm' ? 'text-caption' : 'text-label';
  const toneCls = (() => {
    if (selected) return 'bg-primary border-primary';
    if (tone === 'overseas') return 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500';
    return 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark';
  })();
  const textCls = selected
    ? 'text-white'
    : tone === 'overseas'
      ? 'text-amber-700 dark:text-amber-200'
      : 'text-foreground dark:text-foreground-dark';

  const inner = (
    <View className={`rounded-full border ${padding} ${toneCls}`}>
      <Text className={`${textSize} font-medium ${textCls}`}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}
