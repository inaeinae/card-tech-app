// Step 2 — 이벤트 기본 정보. UI_STRUCTURE.md §8.2 wireframe.
// 6개월 재참여 경고 배너 + 필수 체크박스.
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckSquare, Square } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { useCardStore } from '@/stores/cardStore';
import { useWizardStore } from '@/stores/wizardStore';
import {
  computeReuseWarning,
  validateEventInfo,
  type EventInfoErrors,
} from '@/lib/eventForm';

export default function WizardStepInfo() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const patchDraft = useWizardStore((s) => s.patchDraft);
  const setStep = useWizardStore((s) => s.setStep);
  const card = useCardStore((s) => s.cards.find((c) => c.id === draft.cardId));

  const [noPriorPaymentChecked, setNoPriorPaymentChecked] = useState(false);
  const [errors, setErrors] = useState<EventInfoErrors>({});

  const today = new Date().toISOString().slice(0, 10);
  const warn = useMemo(
    () => computeReuseWarning({ lastEventAt: card?.last_event_at ?? null, today }),
    [card?.last_event_at, today],
  );

  function onNext() {
    const formErrors = validateEventInfo({
      cardId: draft.cardId,
      title: draft.title ?? '',
      organizer: draft.organizer ?? null,
      applyStart: draft.applyStart ?? null,
      applyEnd: draft.applyEnd ?? null,
      useStart: draft.useStart ?? null,
      useEnd: draft.useEnd ?? null,
      noPriorPaymentChecked,
    });
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;
    setStep(3);
    router.push('/wizard/step-benefits');
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-4">
        {warn ? (
          <View className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3">
            <Text className="text-amber-700 dark:text-amber-300">⚠ {warn.message}</Text>
          </View>
        ) : null}

        <Input
          label="이벤트명"
          required
          value={draft.title ?? ''}
          onChangeText={(t) => patchDraft({ title: t })}
          placeholder="예: BC ZONE 25만원 페이백"
          errorText={errors.title}
        />
        <Input
          label="제휴사"
          value={draft.organizer ?? ''}
          onChangeText={(t) => patchDraft({ organizer: t })}
          placeholder="(선택) 예: 카카오페이"
        />

        <View className="flex-row gap-2">
          <View className="flex-1">
            <DatePickerField
              label="응모 시작"
              value={draft.applyStart ?? null}
              onChange={(v) => patchDraft({ applyStart: v ?? undefined })}
            />
          </View>
          <View className="flex-1">
            <DatePickerField
              label="응모 종료"
              value={draft.applyEnd ?? null}
              onChange={(v) => patchDraft({ applyEnd: v ?? undefined })}
              errorText={errors.applyEnd}
            />
          </View>
        </View>

        <View className="flex-row gap-2">
          <View className="flex-1">
            <DatePickerField
              label="이용 시작"
              value={draft.useStart ?? null}
              onChange={(v) => patchDraft({ useStart: v ?? undefined })}
            />
          </View>
          <View className="flex-1">
            <DatePickerField
              label="이용 종료"
              value={draft.useEnd ?? null}
              onChange={(v) => patchDraft({ useEnd: v ?? undefined })}
              errorText={errors.useEnd}
            />
          </View>
        </View>

        <Pressable
          onPress={() => setNoPriorPaymentChecked((v) => !v)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: noPriorPaymentChecked }}
          hitSlop={8}
          className="flex-row items-center gap-2"
        >
          {noPriorPaymentChecked ? (
            <CheckSquare size={20} color="#1E40AF" />
          ) : (
            <Square size={20} color="#94A3B8" />
          )}
          <Text className="text-body text-foreground dark:text-foreground-dark flex-1">
            최근 6개월간 해당 카드사 결제 이력이 없습니다
          </Text>
        </Pressable>
        {errors.noPriorPaymentChecked ? (
          <Text className="text-caption text-destructive dark:text-destructive-dark">
            {errors.noPriorPaymentChecked}
          </Text>
        ) : null}

        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button
              label="이전"
              variant="secondary"
              onPress={() => {
                setStep(1);
                router.back();
              }}
            />
          </View>
          <View className="flex-1">
            <Button label="다음" onPress={onNext} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
