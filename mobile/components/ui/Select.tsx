// 범용 Select — NativeWind 토큰 + Modal 옵션 리스트 (iOS/Android 동일 UX)
import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

export type SelectOption<T extends string> = { value: T; label: string };

type SelectProps<T extends string> = {
  label: string;
  value: T | '';
  options: readonly SelectOption<T>[];
  onChange: (v: T) => void;
  required?: boolean;
  errorText?: string;
  placeholder?: string;
  helperText?: string;
};

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
  required,
  errorText,
  placeholder = '선택하세요',
  helperText,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const hasError = Boolean(errorText);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  return (
    <View className="gap-1.5">
      <Text className="text-label font-medium text-foreground dark:text-foreground-dark">
        {label}
        {required ? <Text className="text-destructive"> *</Text> : null}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label} 선택`}
        className={`h-12 flex-row items-center justify-between rounded-md border bg-surface dark:bg-surface-dark px-4 ${
          hasError
            ? 'border-destructive dark:border-destructive-dark'
            : 'border-border dark:border-border-dark'
        }`}
      >
        <Text
          className={`text-body ${
            selectedLabel
              ? 'text-foreground dark:text-foreground-dark'
              : 'text-muted dark:text-muted-dark'
          }`}
        >
          {selectedLabel || placeholder}
        </Text>
        <ChevronDown size={16} />
      </Pressable>
      {hasError ? (
        <Text className="text-caption text-destructive dark:text-destructive-dark">
          {errorText}
        </Text>
      ) : helperText ? (
        <Text className="text-caption text-muted dark:text-muted-dark">{helperText}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setOpen(false)}
          accessibilityLabel="닫기"
        >
          <Pressable
            onPress={() => {}}
            className="bg-background dark:bg-background-dark rounded-t-md"
          >
            <View className="p-4 border-b border-border dark:border-border-dark">
              <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
                {label}
              </Text>
            </View>
            <FlatList
              data={options as SelectOption<T>[]}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className="px-4 py-4 border-b border-border dark:border-border-dark"
                  accessibilityRole="button"
                >
                  <Text className="text-body text-foreground dark:text-foreground-dark">
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
