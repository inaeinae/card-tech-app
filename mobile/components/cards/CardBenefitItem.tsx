// 상시 혜택 한 줄 — 제목 + details 간단 표시
import { Text, View } from 'react-native';
import type { CardBenefit } from '@/types/models';

export function CardBenefitItem({ benefit }: { benefit: CardBenefit }) {
  const detailKeys = Object.keys((benefit.details ?? {}) as Record<string, unknown>);
  return (
    <View className="px-4 py-3 rounded-md bg-surface dark:bg-surface-dark border border-border dark:border-border-dark gap-1">
      <Text className="text-body font-medium text-foreground dark:text-foreground-dark">
        {benefit.title}
      </Text>
      {detailKeys.length > 0 && (
        <Text className="text-label text-muted dark:text-muted-dark">
          {JSON.stringify(benefit.details)}
        </Text>
      )}
    </View>
  );
}
