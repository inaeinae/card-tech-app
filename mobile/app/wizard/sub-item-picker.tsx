// 자동납부 등 하위 항목 멀티 선택 + 직접 추가 + 금액 인풋.
// 확인 시 wizardStore.addBenefit 으로 즉시 등록 후 step-benefits 로 복귀.
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckSquare, Plus, Square } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getTemplateById } from '@/lib/templates';
import { useWizardStore } from '@/stores/wizardStore';

type Row = { label: string; eligible: boolean; amount: number };

export default function SubItemPicker() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const template = useMemo(() => getTemplateById(templateId ?? ''), [templateId]);
  const addBenefit = useWizardStore((s) => s.addBenefit);

  const [rows, setRows] = useState<Row[]>(
    (template?.presetSubItems ?? []).map((s) => ({
      label: s.label,
      eligible: false,
      amount: s.defaultAmount ?? 0,
    })),
  );
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');

  if (!template) {
    return (
      <View className="flex-1 bg-background dark:bg-background-dark p-4">
        <Text className="text-foreground dark:text-foreground-dark">템플릿이 없습니다.</Text>
      </View>
    );
  }

  function toggle(idx: number) {
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, eligible: !r.eligible } : r)));
  }

  function patchAmount(idx: number, raw: string) {
    const n = Number(raw.replace(/[^0-9]/g, '')) || 0;
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, amount: n } : r)));
  }

  function addCustom() {
    const label = newLabel.trim();
    const amount = Number(newAmount.replace(/[^0-9]/g, '')) || 0;
    if (!label) return;
    setRows((rs) => [...rs, { label, eligible: true, amount }]);
    setNewLabel('');
    setNewAmount('');
  }

  function onSave() {
    addBenefit({
      templateId: template!.id,
      type: template!.type,
      label: template!.defaultTitle ?? template!.label,
      expectedAmount: rows.reduce((acc, r) => acc + (r.eligible ? r.amount : 0), 0),
      conditions: { items: rows },
    });
    router.replace('/wizard/step-benefits');
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-3">
        <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
          {template.label}
        </Text>
        {rows.map((r, idx) => (
          <View
            key={`${r.label}-${idx}`}
            className="flex-row items-center gap-3 p-3 rounded-md bg-surface dark:bg-surface-dark border border-border dark:border-border-dark"
          >
            <Pressable
              onPress={() => toggle(idx)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: r.eligible }}
              hitSlop={8}
            >
              {r.eligible ? (
                <CheckSquare size={20} color="#1E40AF" />
              ) : (
                <Square size={20} color="#94A3B8" />
              )}
            </Pressable>
            <Text className="flex-1 text-body text-foreground dark:text-foreground-dark">
              {r.label}
            </Text>
            <TextInput
              value={String(r.amount)}
              onChangeText={(t) => patchAmount(idx, t)}
              keyboardType="number-pad"
              accessibilityLabel={`${r.label} 금액`}
              className="w-24 h-10 px-3 rounded-md border border-border dark:border-border-dark text-right text-body text-foreground dark:text-foreground-dark"
            />
          </View>
        ))}

        <View className="mt-2 gap-2">
          <Text className="text-label text-muted dark:text-muted-dark">직접 추가</Text>
          <Input
            label="항목명"
            value={newLabel}
            onChangeText={setNewLabel}
            placeholder="예: 통신요금"
          />
          <Input
            label="금액"
            value={newAmount}
            onChangeText={setNewAmount}
            keyboardType="number-pad"
          />
          <Button
            label="추가"
            variant="secondary"
            leftIcon={<Plus size={16} color="#94A3B8" />}
            onPress={addCustom}
          />
        </View>

        <Button label="혜택 저장" onPress={onSave} />
      </View>
    </ScrollView>
  );
}
