// 혜택 템플릿 / 카테고리 선택.
// context=event(기본): BENEFIT_TEMPLATES 그리드 — autopay 면 sub-item-picker, 그 외는 benefit-form.
// context=card: BENEFIT_CATEGORIES 목록형(1열, ChevronRight) — sub-item-picker?context=card&category=... 로.
// UI_STRUCTURE.md §8.3-a wireframe + Phase 5.3 카드 컨텍스트 분기.
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { BENEFIT_TEMPLATES, BENEFIT_CATEGORIES } from '@/lib/templates';

export default function TemplatePicker() {
  const router = useRouter();
  const { context, cardId } = useLocalSearchParams<{ context?: string; cardId?: string }>();
  const isCard = context === 'card';

  // 카드 컨텍스트: 카테고리 선택 후 카테고리별 가맹점 프리셋 화면으로
  function goCardCategory(categoryId: string) {
    const cidParam = cardId ? `&cardId=${cardId}` : '';
    router.push(`/wizard/sub-item-picker?context=card&category=${categoryId}${cidParam}`);
  }

  // 이벤트 컨텍스트: 템플릿 선택 — autopay 면 sub-item-picker, 그 외는 benefit-form
  function goEventTemplate(templateId: string, supportsSubItems: boolean) {
    if (supportsSubItems) {
      router.replace(`/wizard/sub-item-picker?templateId=${templateId}`);
    } else {
      router.replace(`/wizard/benefit-form?templateId=${templateId}`);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-3">
        <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
          {isCard ? '카테고리 선택' : '템플릿 선택'}
        </Text>
        {isCard ? (
          <View className="gap-2">
            {BENEFIT_CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => goCardCategory(c.id)}
                accessibilityRole="button"
                accessibilityLabel={c.label}
                hitSlop={4}
                className="flex-row items-center justify-between rounded-md border border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-4 py-3"
              >
                <Text className="text-body text-foreground dark:text-foreground-dark">
                  {c.label}
                </Text>
                <ChevronRight size={16} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-3">
            {BENEFIT_TEMPLATES.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => goEventTemplate(t.id, t.supportsSubItems)}
                accessibilityRole="button"
                accessibilityLabel={t.label}
                hitSlop={4}
                className="basis-[31%] grow aspect-square rounded-md bg-surface dark:bg-surface-dark border border-border dark:border-border-dark items-center justify-center p-2"
              >
                <Text className="text-body font-medium text-foreground dark:text-foreground-dark text-center">
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
