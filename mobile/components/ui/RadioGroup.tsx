// 인라인 라디오 그룹 — 카드 종류 같은 1줄 선택 용
import { Pressable, Text, View } from 'react-native';

export type RadioOption<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  value: T | '';
  options: readonly RadioOption<T>[];
  onChange: (v: T) => void;
  required?: boolean;
  errorText?: string;
};

export function RadioGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  required,
  errorText,
}: Props<T>) {
  const hasError = Boolean(errorText);
  return (
    <View className="gap-1.5">
      <Text className="text-label font-medium text-foreground dark:text-foreground-dark">
        {label}
        {required ? <Text className="text-destructive"> *</Text> : null}
      </Text>
      <View className="flex-row gap-2">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={o.label}
              className={`flex-1 h-12 items-center justify-center rounded-md border ${
                selected
                  ? 'border-primary bg-primary/10 dark:bg-primary/20'
                  : hasError
                    ? 'border-destructive dark:border-destructive-dark'
                    : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark'
              }`}
            >
              <Text
                className={`text-body font-medium ${
                  selected ? 'text-primary' : 'text-foreground dark:text-foreground-dark'
                }`}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {hasError ? (
        <Text className="text-caption text-destructive dark:text-destructive-dark">
          {errorText}
        </Text>
      ) : null}
    </View>
  );
}
