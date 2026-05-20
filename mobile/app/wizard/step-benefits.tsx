// Step 3 — 혜택 추가/편집/삭제 + 합계.
// UI_STRUCTURE.md §8.3 wireframe.
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pencil, Plus, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useWizardStore } from '@/stores/wizardStore';
import { computeBenefitAmount, computeExpectedTotal } from '@/lib/benefitSum';

export default function WizardStepBenefits() {
  const router = useRouter();
  const benefits = useWizardStore((s) => s.draft.benefits);
  const removeBenefit = useWizardStore((s) => s.removeBenefit);
  const setStep = useWizardStore((s) => s.setStep);
  const total = computeExpectedTotal(benefits);

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-2">
        <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
          혜택 추가
        </Text>
        <Text className="text-body text-muted dark:text-muted-dark">
          이 이벤트로 받을 혜택을 모두 등록하세요
        </Text>
      </View>

      {benefits.length === 0 ? (
        <EmptyState title="아직 혜택이 없습니다" />
      ) : (
        <FlatList
          data={benefits}
          keyExtractor={(b) => b.tempId}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <View className="rounded-md p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark gap-1">
              <Text className="text-label text-muted dark:text-muted-dark">{item.type}</Text>
              <Text className="text-body font-medium text-foreground dark:text-foreground-dark">
                {item.label}
              </Text>
              <Text className="text-body text-foreground dark:text-foreground-dark">
                예상: ₩{computeBenefitAmount(item).toLocaleString('ko-KR')}
              </Text>
              <View className="flex-row gap-2 mt-2">
                <Pressable
                  onPress={() => router.push(`/wizard/benefit-form?tempId=${item.tempId}`)}
                  accessibilityRole="button"
                  accessibilityLabel="혜택 편집"
                  hitSlop={8}
                  className="flex-row items-center gap-1"
                >
                  <Pencil size={16} />
                  <Text className="text-label text-muted dark:text-muted-dark">편집</Text>
                </Pressable>
                <Pressable
                  onPress={() => removeBenefit(item.tempId)}
                  accessibilityRole="button"
                  accessibilityLabel="혜택 삭제"
                  hitSlop={8}
                  className="flex-row items-center gap-1"
                >
                  <Trash2 size={16} />
                  <Text className="text-label text-destructive dark:text-destructive-dark">
                    삭제
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <View className="p-4 gap-3 border-t border-border dark:border-border-dark">
        <Button
          label="혜택 추가"
          variant="secondary"
          leftIcon={<Plus size={16} />}
          onPress={() => router.push('/wizard/template-picker')}
        />

        <View className="flex-row justify-between">
          <Text className="text-body text-muted dark:text-muted-dark">예상 수령 합계</Text>
          <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
            ₩{total.toLocaleString('ko-KR')}
          </Text>
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button
              label="이전"
              variant="secondary"
              onPress={() => {
                setStep(2);
                router.back();
              }}
            />
          </View>
          <View className="flex-1">
            <Button
              label="다음"
              disabled={benefits.length === 0}
              onPress={() => {
                setStep(4);
                router.push('/wizard/step-review');
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
