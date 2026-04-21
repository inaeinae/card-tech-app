// 빈 상태 — 설명 + 액션 CTA
import { Text, View } from 'react-native';
import { Button } from './Button';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
};

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-6 py-12 gap-3">
      {icon ? <View className="mb-2">{icon}</View> : null}
      <Text className="text-headline font-bold text-foreground dark:text-foreground-dark text-center">
        {title}
      </Text>
      {description ? (
        <Text className="text-body text-muted dark:text-muted-dark text-center">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-2 w-full max-w-xs">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
