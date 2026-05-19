// Step 2 — 이벤트 기본 정보. UI_STRUCTURE.md §8.2 wireframe.
// 재참여 노티는 step-card에서 카드 선택 직후 표시 — 이 화면에선 정보 입력에 집중.
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { useWizardStore } from '@/stores/wizardStore';
import { validateEventInfo, type EventInfoErrors } from '@/lib/eventForm';

export default function WizardStepInfo() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const patchDraft = useWizardStore((s) => s.patchDraft);
  const setStep = useWizardStore((s) => s.setStep);

  const [errors, setErrors] = useState<EventInfoErrors>({});

  function onNext() {
    const formErrors = validateEventInfo({
      cardId: draft.cardId,
      title: draft.title ?? '',
      organizer: draft.organizer ?? null,
      applyStart: draft.applyStart ?? null,
      applyEnd: draft.applyEnd ?? null,
      useStart: draft.useStart ?? null,
      useEnd: draft.useEnd ?? null,
    });
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;
    setStep(3);
    router.push('/wizard/step-benefits');
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-4">
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
