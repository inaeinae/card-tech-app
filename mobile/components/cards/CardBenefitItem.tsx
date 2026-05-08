// 상시 혜택 한 줄 — 제목 + details + (옵션) 삭제 버튼
import { Pressable, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';

type CardBenefitItemProps = {
  title: string;
  details?: Record<string, unknown> | null;
  onDelete?: () => void;
};

export function CardBenefitItem({ title, details, onDelete }: CardBenefitItemProps) {
  const detailKeys = Object.keys((details ?? {}) as Record<string, unknown>);
  return (
    <View className="px-4 py-3 rounded-md bg-surface dark:bg-surface-dark border border-border dark:border-border-dark flex-row items-center gap-3">
      <View className="flex-1 gap-1">
        <Text className="text-body font-medium text-foreground dark:text-foreground-dark">
          {title}
        </Text>
        {detailKeys.length > 0 && (
          <Text className="text-label text-muted dark:text-muted-dark">
            {JSON.stringify(details)}
          </Text>
        )}
      </View>
      {onDelete && (
        <Pressable
          onPress={onDelete}
          accessibilityLabel="혜택 삭제"
          accessibilityRole="button"
          hitSlop={8}
        >
          <Trash2 size={18} color="#FF4D4F" />
        </Pressable>
      )}
    </View>
  );
}
