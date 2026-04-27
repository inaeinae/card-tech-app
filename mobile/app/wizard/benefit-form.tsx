// 단일 혜택 편집 폼 — 신규(template 진입) 또는 기존(tempId) 편집.
// 저장 후 step-benefits 로 복귀.
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getTemplateById } from '@/lib/templates';
import { useWizardStore } from '@/stores/wizardStore';

export default function BenefitForm() {
  const router = useRouter();
  const { templateId, tempId } = useLocalSearchParams<{
    templateId?: string;
    tempId?: string;
  }>();
  const draft = useWizardStore((s) => s.draft);
  const addBenefit = useWizardStore((s) => s.addBenefit);
  const updateBenefit = useWizardStore((s) => s.updateBenefit);

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

  function onSave() {
    const expected = Number(amount.replace(/[^0-9]/g, '')) || 0;
    if (existing) {
      updateBenefit(existing.tempId, { label, expectedAmount: expected });
    } else if (template) {
      addBenefit({
        templateId: template.id,
        type: template.type,
        label,
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
