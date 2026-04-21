// 레이블 포함 텍스트 입력 — 라벨 필수, 에러는 필드 바로 아래
import { forwardRef } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

type InputProps = TextInputProps & {
  label: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, helperText, errorText, required, style, ...textInput },
  ref,
) {
  const scheme = useColorScheme();
  const placeholderColor = scheme === 'dark' ? '#94A3B8' : '#64748B';
  const hasError = Boolean(errorText);

  return (
    <View className="gap-1.5">
      <Text
        className="text-label font-medium text-foreground dark:text-foreground-dark"
        accessibilityRole="text"
      >
        {label}
        {required ? <Text className="text-destructive"> *</Text> : null}
      </Text>
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderColor}
        className={`h-12 rounded-md border bg-surface dark:bg-surface-dark px-4 text-body text-foreground dark:text-foreground-dark ${
          hasError
            ? 'border-destructive dark:border-destructive-dark'
            : 'border-border dark:border-border-dark'
        }`}
        accessibilityLabel={label}
        accessibilityState={{ disabled: textInput.editable === false }}
        style={style}
        {...textInput}
      />
      {hasError ? (
        <Text className="text-caption text-destructive dark:text-destructive-dark" accessibilityLiveRegion="polite">
          {errorText}
        </Text>
      ) : helperText ? (
        <Text className="text-caption text-muted dark:text-muted-dark">{helperText}</Text>
      ) : null}
    </View>
  );
});
