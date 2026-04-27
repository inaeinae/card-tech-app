// ISO YYYY-MM-DD 문자열 in/out DatePicker — 라벨/에러는 Input 과 동일 톤
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

type Props = {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  placeholder?: string;
};

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DatePickerField({
  label,
  value,
  onChange,
  helperText,
  errorText,
  required,
  placeholder = '날짜 선택',
}: Props) {
  const [open, setOpen] = useState(false);
  const hasError = Boolean(errorText);
  const display = value ?? placeholder;

  function handleChange(_e: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') setOpen(false);
    if (!date) return;
    onChange(toIsoDate(date));
  }

  return (
    <View className="gap-1.5">
      <Text className="text-label font-medium text-foreground dark:text-foreground-dark">
        {label}
        {required ? <Text className="text-destructive"> *</Text> : null}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} ${value ?? '미선택'}`}
        hitSlop={8}
        onPress={() => setOpen(true)}
        className={`h-12 rounded-md border bg-surface dark:bg-surface-dark px-4 justify-center ${
          hasError
            ? 'border-destructive dark:border-destructive-dark'
            : 'border-border dark:border-border-dark'
        }`}
      >
        <Text
          className={`text-body ${
            value
              ? 'text-foreground dark:text-foreground-dark'
              : 'text-muted dark:text-muted-dark'
          }`}
        >
          {display}
        </Text>
      </Pressable>
      {open && (
        <DateTimePicker
          value={value ? new Date(value + 'T00:00:00') : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          locale="ko-KR"
          onChange={handleChange}
        />
      )}
      {hasError ? (
        <Text className="text-caption text-destructive dark:text-destructive-dark">
          {errorText}
        </Text>
      ) : helperText ? (
        <Text className="text-caption text-muted dark:text-muted-dark">{helperText}</Text>
      ) : null}
    </View>
  );
}
