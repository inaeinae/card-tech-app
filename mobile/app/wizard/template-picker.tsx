// 혜택 템플릿 선택 그리드. 선택 → autopay 면 sub-item-picker, 그 외는 benefit-form 푸시.
// context=card: 이벤트 전용(isEventOnly) 템플릿 숨김. context=event(기본): 전체 표시.
// UI_STRUCTURE.md §8.3-a wireframe.
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BENEFIT_TEMPLATES } from '@/lib/templates';

export default function TemplatePicker() {
  const router = useRouter();
  const { context, cardId } = useLocalSearchParams<{ context?: string; cardId?: string }>();
  const isCardContext = context === 'card';

  const templates = useMemo(
    () => (isCardContext ? BENEFIT_TEMPLATES.filter((t) => !t.isEventOnly) : BENEFIT_TEMPLATES),
    [isCardContext],
  );

  const extraParams = (() => {
    if (!isCardContext) return '';
    const cardIdPart = cardId ? `&cardId=${cardId}` : '';
    return `&context=card${cardIdPart}`;
  })();

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 flex-row flex-wrap gap-3">
        {templates.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => {
              if (t.supportsSubItems) {
                router.replace(`/wizard/sub-item-picker?templateId=${t.id}${extraParams}`);
              } else {
                router.replace(`/wizard/benefit-form?templateId=${t.id}${extraParams}`);
              }
            }}
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
    </ScrollView>
  );
}
