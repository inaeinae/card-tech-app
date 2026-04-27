// 혜택 템플릿 선택 그리드. 선택 → autopay 면 sub-item-picker, 그 외는 benefit-form 푸시.
// UI_STRUCTURE.md §8.3-a wireframe.
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BENEFIT_TEMPLATES } from '@/lib/templates';

export default function TemplatePicker() {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 flex-row flex-wrap gap-3">
        {BENEFIT_TEMPLATES.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => {
              if (t.supportsSubItems) {
                router.replace(`/wizard/sub-item-picker?templateId=${t.id}`);
              } else {
                router.replace(`/wizard/benefit-form?templateId=${t.id}`);
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
