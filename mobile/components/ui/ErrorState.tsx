// 에러 — 원인 + 복구 액션 (재시도/도움말)
import { Text, View } from 'react-native';
import { Button } from './Button';

type ErrorStateProps = {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = '문제가 발생했어요',
  message,
  retryLabel = '다시 시도',
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="items-center justify-center px-6 py-12 gap-3">
      <Text
        className="text-headline font-bold text-destructive dark:text-destructive-dark text-center"
        accessibilityRole="alert"
      >
        {title}
      </Text>
      {message ? (
        <Text className="text-body text-muted dark:text-muted-dark text-center">{message}</Text>
      ) : null}
      {onRetry ? (
        <View className="mt-2 w-full max-w-xs">
          <Button label={retryLabel} variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
