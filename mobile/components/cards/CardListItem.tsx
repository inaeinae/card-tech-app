// 카드 리스트 · 캐러셀 공용 행 — 카드사 + 이름 + 해지 배지
// variant=row: 가로형 행 (홈 리스트), variant=carousel: 16:10 카드 (홈 캐러셀)
import { Pressable, Text, View } from 'react-native';
import { CreditCard } from 'lucide-react-native';
import type { Card } from '@/types/models';
import { computeCancelState } from '@/lib/cardCancel';

type Props = {
  card: Card;
  onPress?: () => void;
  variant?: 'row' | 'carousel';
};

export function CardListItem({ card, onPress, variant = 'row' }: Props) {
  const cancelState = computeCancelState({
    canceled_at: card.canceled_at,
    cancel_scheduled_at: card.cancel_scheduled_at,
  });

  const isCarousel = variant === 'carousel';
  const stateLabel =
    cancelState === 'scheduled' ? '해지 예약' : cancelState === 'canceled' ? '해지 완료' : null;
  const a11yLabel = `${card.issuer} ${card.name}${stateLabel ? `, ${stateLabel}` : ''}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      hitSlop={8}
      className={`${
        isCarousel ? 'w-64 mr-3' : 'w-full'
      } rounded-md overflow-hidden bg-surface dark:bg-surface-dark border border-border dark:border-border-dark`}
    >
      {isCarousel ? (
        <View style={{ aspectRatio: 16 / 10 }}>
          <CardThumb />
        </View>
      ) : (
        <View className="flex-row items-center">
          <View className="w-20 h-20">
            <CardThumb />
          </View>
          <View className="flex-1 px-3 py-3 gap-1">
            <Text className="text-label text-muted dark:text-muted-dark">{card.issuer}</Text>
            <Text
              className="text-body font-medium text-foreground dark:text-foreground-dark"
              numberOfLines={1}
            >
              {card.name}
            </Text>
            {stateLabel ? (
              <Text
                className={
                  cancelState === 'scheduled'
                    ? 'text-caption text-amber-700 dark:text-amber-300'
                    : 'text-caption text-destructive dark:text-destructive-dark'
                }
              >
                {stateLabel}
              </Text>
            ) : null}
          </View>
        </View>
      )}
      {isCarousel ? (
        <View className="p-3 gap-1">
          <Text className="text-label text-muted dark:text-muted-dark">{card.issuer}</Text>
          <Text
            className="text-body font-medium text-foreground dark:text-foreground-dark"
            numberOfLines={1}
          >
            {card.name}
          </Text>
          {stateLabel ? (
            <Text
              className={
                cancelState === 'scheduled'
                  ? 'text-caption text-amber-700 dark:text-amber-300'
                  : 'text-caption text-destructive dark:text-destructive-dark'
              }
            >
              {stateLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

function CardThumb() {
  return (
    <View className="flex-1 items-center justify-center bg-surface dark:bg-surface-dark">
      <CreditCard size={28} color="#94A3B8" />
    </View>
  );
}
