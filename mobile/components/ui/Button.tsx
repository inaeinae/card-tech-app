// 기본 버튼 — Pressable 기반. 44pt 터치 타겟 · accessibilityRole 고정 · 로딩 시 비활성
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { PressableProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

// 크기 토큰 (min-height 포함 — 최소 44pt 보장)
const sizeClass: Record<Size, string> = {
  sm: 'h-10 px-4',
  md: 'h-12 px-5',
  lg: 'h-14 px-6',
};

const textSize: Record<Size, string> = {
  sm: 'text-label',
  md: 'text-body',
  lg: 'text-headline',
};

function containerClass(variant: Variant, disabled: boolean): string {
  const base = 'flex-row items-center justify-center rounded-md';
  const opacity = disabled ? 'opacity-50' : '';
  const byVariant = {
    primary: 'bg-primary dark:bg-primary-dark',
    secondary: 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark',
    ghost: 'bg-transparent',
    destructive: 'bg-destructive dark:bg-destructive-dark',
  }[variant];
  return `${base} ${byVariant} ${opacity}`.trim();
}

function textClass(variant: Variant): string {
  return {
    primary: 'text-white font-bold',
    secondary: 'text-foreground dark:text-foreground-dark font-medium',
    ghost: 'text-primary dark:text-primary-dark font-medium',
    destructive: 'text-white font-bold',
  }[variant];
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  ...pressable
}: ButtonProps) {
  const scheme = useColorScheme();
  const isDisabled = disabled || loading;
  const spinnerColor = variant === 'secondary' || variant === 'ghost'
    ? scheme === 'dark' ? '#F8FAFC' : '#0F172A'
    : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={8}
      android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
      className={`${containerClass(variant, isDisabled)} ${sizeClass[size]}`}
      {...pressable}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text className={`${textClass(variant)} ${textSize[size]}`}>{label}</Text>
          {rightIcon}
        </View>
      )}
    </Pressable>
  );
}
