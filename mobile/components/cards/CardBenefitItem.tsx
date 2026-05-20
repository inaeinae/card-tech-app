// 카드 상시 혜택 셀 — 고밀도. category Chip + 할인율/방식 + 대상 + cap_tier + 메모.
import { Pressable, Text, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Chip } from '@/components/ui/Chip';
import { formatWon } from '@/lib/formatWon';
import { DISCOUNT_METHOD_LABEL, type CardBenefit } from '@/types/models';

type Props = {
  benefit: Pick<
    CardBenefit,
    | 'category'
    | 'title'
    | 'discount_pct'
    | 'discount_method'
    | 'min_spend_won'
    | 'monthly_cap_won'
    | 'overseas_only'
    | 'notes'
    | 'targets'
    | 'cap_tiers'
  >;
  onDelete?: () => void;
};

export function CardBenefitItem({ benefit, onDelete }: Props) {
  const headline = (() => {
    const parts: string[] = [];
    if (benefit.discount_pct !== null && benefit.discount_pct !== undefined) {
      parts.push(`${benefit.discount_pct}%`);
    }
    if (benefit.discount_method) {
      parts.push(DISCOUNT_METHOD_LABEL[benefit.discount_method]);
    }
    return parts.join(' ');
  })();

  return (
    <View className="rounded-md border border-border dark:border-border-dark bg-surface dark:bg-surface-dark p-4 gap-2">
      {/* 1행: 카테고리 + 제목 + 삭제 */}
      <View className="flex-row items-center gap-2">
        {benefit.category ? <Chip label={benefit.category} size="sm" /> : null}
        {benefit.overseas_only ? <Chip label="해외겸용 한정" size="sm" tone="overseas" /> : null}
        <Text className="flex-1 text-body font-medium text-foreground dark:text-foreground-dark">
          {benefit.title}
        </Text>
        {onDelete ? (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="혜택 삭제"
            hitSlop={8}
          >
            <Trash2 size={18} />
          </Pressable>
        ) : null}
      </View>

      {headline ? (
        <Text className="text-label text-muted dark:text-muted-dark">{headline}</Text>
      ) : null}

      {/* 2행: 대상 가맹점 요약 */}
      {benefit.targets.length > 0 ? (
        <Text
          className="text-label text-muted dark:text-muted-dark"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {benefit.targets
            .map((t) => t.merchants.split(',')[0]?.trim() ?? '')
            .filter((s) => s.length > 0)
            .join(' · ')}
        </Text>
      ) : null}

      {/* 대상 구분 */}
      {benefit.targets.length > 0 ? (
        <View className="gap-1 border-t border-border dark:border-border-dark pt-2">
          <Text className="text-caption text-muted dark:text-muted-dark">구분 · 대상</Text>
          {benefit.targets.map((t) => (
            <Text
              key={t.id ?? `${t.group_label}-${t.sort_order}`}
              className="text-label text-foreground dark:text-foreground-dark"
            >
              • {t.group_label}: {t.merchants}
            </Text>
          ))}
        </View>
      ) : null}

      {/* 한도 */}
      {benefit.cap_tiers.length > 0 || benefit.monthly_cap_won !== null ? (
        <View className="gap-1 border-t border-border dark:border-border-dark pt-2">
          <Text className="text-caption text-muted dark:text-muted-dark">한도</Text>
          {benefit.cap_tiers.length > 0 ? (
            benefit.cap_tiers.map((t) => (
              <Text
                key={t.id ?? t.min_spend_won}
                className="text-label text-foreground dark:text-foreground-dark"
              >
                • 전월 {formatWon(t.min_spend_won)}원↑ → 월 {formatWon(t.cap_won)}원
              </Text>
            ))
          ) : (
            <Text className="text-label text-foreground dark:text-foreground-dark">
              • 월 {formatWon(benefit.monthly_cap_won)}원
              {benefit.min_spend_won !== null
                ? ` (전월 ${formatWon(benefit.min_spend_won)}원↑)`
                : ''}
            </Text>
          )}
        </View>
      ) : null}

      {/* 메모 */}
      {benefit.notes ? (
        <View className="border-t border-border dark:border-border-dark pt-2">
          <Text className="text-caption text-muted dark:text-muted-dark">※ {benefit.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}
