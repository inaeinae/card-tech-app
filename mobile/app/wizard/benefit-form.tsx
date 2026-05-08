// 단일 혜택 편집 폼 — 신규(template 진입) 또는 기존(tempId) 편집.
// context=card 파라미터가 있으면 cardStore 경유 저장, 없으면 wizardStore 경유 저장.
// 저장 후 card 컨텍스트는 router.back(), wizard 컨텍스트는 step-benefits 로 복귀.
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getTemplateById } from '@/lib/templates';
import { useWizardStore } from '@/stores/wizardStore';
import { useCardStore } from '@/stores/cardStore';

export default function BenefitForm() {
  const router = useRouter();
  const { templateId, tempId, context, cardId } = useLocalSearchParams<{
    templateId?: string;
    tempId?: string;
    context?: string;
    cardId?: string;
  }>();
  const isCardContext = context === 'card';

  // wizardStore 셀렉터
  const draft = useWizardStore((s) => s.draft);
  const addBenefit = useWizardStore((s) => s.addBenefit);
  const updateBenefit = useWizardStore((s) => s.updateBenefit);

  // cardStore 셀렉터
  const addDraftBenefit = useCardStore((s) => s.addDraftBenefit);
  const upsertCardBenefit = useCardStore((s) => s.upsertCardBenefit);

  const existing = useMemo(
    () => draft.benefits.find((b) => b.tempId === tempId),
    [draft.benefits, tempId],
  );
  const template = useMemo(
    () =>
      templateId
        ? getTemplateById(templateId)
        : existing
          ? getTemplateById(existing.templateId)
          : null,
    [templateId, existing],
  );

  const [label, setLabel] = useState(existing?.label ?? template?.defaultTitle ?? '');
  const [amount, setAmount] = useState(
    existing?.expectedAmount?.toString() ?? template?.defaultExpectedAmount?.toString() ?? '',
  );

  useEffect(() => {
    if (existing) {
      setLabel(existing.label);
      setAmount(existing.expectedAmount?.toString() ?? '');
    }
  }, [existing]);

  async function onSave() {
    const expected = Number(amount.replace(/[^0-9]/g, '')) || 0;
    const trimmed = label.trim();
    if (!trimmed) return;

    if (isCardContext) {
      // 카드 상시 혜택은 기간/실적 조건 없음 — expectedAmount 는 details 에 보조 정보로만 저장
      const details = expected > 0 ? { expectedAmount: expected } : null;
      if (cardId) {
        await upsertCardBenefit(cardId, { title: trimmed, details });
      } else {
        addDraftBenefit({ title: trimmed, details });
      }
      router.back();
      return;
    }

    // 이벤트 위저드 컨텍스트 (기존 동작)
    if (existing) {
      updateBenefit(existing.tempId, { label: trimmed, expectedAmount: expected });
    } else if (template) {
      addBenefit({
        templateId: template.id,
        type: template.type,
        label: trimmed,
        expectedAmount: expected,
      });
    }
    router.replace('/wizard/step-benefits');
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-3">
        <Input label="혜택 제목" required value={label} onChangeText={setLabel} />
        <Input
          label="예상 금액 (원)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
          placeholder="0"
        />
        <Button label="저장" onPress={onSave} />
      </View>
    </ScrollView>
  );
}
