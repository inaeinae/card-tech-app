// Step 4 — 요약 + 저장. UI_STRUCTURE.md §8.4 wireframe.
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useCardStore } from '@/stores/cardStore';
import { useWizardStore } from '@/stores/wizardStore';
import { computeBenefitAmount, computeExpectedTotal } from '@/lib/benefitSum';

export default function WizardStepReview() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();
  const draft = useWizardStore((s) => s.draft);
  const submit = useWizardStore((s) => s.submit);
  const reset = useWizardStore((s) => s.reset);
  const card = useCardStore((s) => s.cards.find((c) => c.id === draft.cardId));
  const total = computeExpectedTotal(draft.benefits);
  const [submitting, setSubmitting] = useState(false);

  async function onSave() {
    setSubmitting(true);
    try {
      const result = await submit({ eventId });
      reset();
      router.dismissAll();
      router.replace(`/events/${result.eventId}`);
    } catch (e) {
      Alert.alert('저장 실패', e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-3">
        <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
          최종 확인
        </Text>

        <View className="rounded-md p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark gap-1">
          <Text className="text-label text-muted dark:text-muted-dark">카드</Text>
          <Text className="text-body text-foreground dark:text-foreground-dark">
            {card ? `${card.issuer} · ${card.name}` : '카드 정보 없음'}
          </Text>
        </View>
        <View className="rounded-md p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark gap-1">
          <Text className="text-label text-muted dark:text-muted-dark">이벤트</Text>
          <Text className="text-body text-foreground dark:text-foreground-dark">
            {draft.title}
          </Text>
          {draft.organizer ? (
            <Text className="text-label text-muted dark:text-muted-dark">{draft.organizer}</Text>
          ) : null}
          <Text className="text-label text-muted dark:text-muted-dark mt-1">
            응모 {draft.applyStart ?? '-'} ~ {draft.applyEnd ?? '-'}
          </Text>
          <Text className="text-label text-muted dark:text-muted-dark">
            이용 {draft.useStart ?? '-'} ~ {draft.useEnd ?? '-'}
          </Text>
        </View>

        <Text className="text-headline font-bold text-foreground dark:text-foreground-dark mt-2">
          혜택 {draft.benefits.length}건
        </Text>
        {draft.benefits.map((b) => (
          <View
            key={b.tempId}
            className="rounded-md p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark"
          >
            <Text className="text-body font-medium text-foreground dark:text-foreground-dark">
              {b.label}
            </Text>
            <Text className="text-label text-muted dark:text-muted-dark">
              ₩{computeBenefitAmount(b).toLocaleString('ko-KR')}
            </Text>
          </View>
        ))}

        <View className="flex-row justify-between mt-2 pt-2 border-t border-border dark:border-border-dark">
          <Text className="text-body text-muted dark:text-muted-dark">예상 수령 합계</Text>
          <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
            ₩{total.toLocaleString('ko-KR')}
          </Text>
        </View>

        <View className="rounded-md p-3 border border-border dark:border-border-dark mt-2 gap-1">
          <Text className="text-label text-muted dark:text-muted-dark">자동 스케줄 예정 알림</Text>
          <Text className="text-caption text-muted dark:text-muted-dark">
            응모 마감 1일 전 / 실적 점검 / 지급 7일 전 — Phase 11 에서 활성화
          </Text>
        </View>

        <Button label="저장" loading={submitting} onPress={onSave} />
      </View>
    </ScrollView>
  );
}
