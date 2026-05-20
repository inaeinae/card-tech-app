// 자동납부 등 하위 항목 멀티 선택 + 직접 추가 + 금액 인풋.
// context=card 일 때는 카드 카테고리별 가맹점 프리셋(CATEGORY_PRESETS) 멀티선택 화면을 노출하고,
// 이벤트 컨텍스트는 기존 BenefitTemplate.presetSubItems 기반 동작을 그대로 유지한다.
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckSquare, Plus, Square } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CATEGORY_PRESETS, getTemplateById } from '@/lib/templates';
import { useWizardStore } from '@/stores/wizardStore';

type Row = { label: string; eligible: boolean; amount: number };

export default function SubItemPicker() {
  const router = useRouter();
  const { templateId, context, cardId, category } = useLocalSearchParams<{
    templateId?: string;
    context?: string;
    cardId?: string;
    category?: string;
  }>();
  const isCardContext = context === 'card';

  // 카드 컨텍스트는 별도 분기(카테고리별 가맹점 프리셋 멀티선택)
  if (isCardContext) {
    return <CardContextPicker category={category} cardId={cardId} router={router} />;
  }

  // ↓↓↓ 기존 이벤트 위저드 분기 — Phase 5.3 이전 동작 보존
  return <EventContextPicker templateId={templateId} router={router} />;
}

// 이벤트 위저드 — BenefitTemplate.presetSubItems 기반 멀티선택(기존 동작 유지)
function EventContextPicker({
  templateId,
  router,
}: {
  templateId?: string;
  router: ReturnType<typeof useRouter>;
}) {
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
    const totalAmount = rows.reduce((acc, r) => acc + (r.eligible ? r.amount : 0), 0);
    const title = template!.defaultTitle ?? template!.label;

    addBenefit({
      templateId: template!.id,
      type: template!.type,
      label: title,
      expectedAmount: totalAmount,
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

// 카드 상시혜택 위저드 — 카테고리별 가맹점 프리셋(CATEGORY_PRESETS) 멀티선택 또는 건너뛰기
function CardContextPicker({
  category,
  cardId,
  router,
}: {
  category?: string;
  cardId?: string;
  router: ReturnType<typeof useRouter>;
}) {
  const presets = category ? (CATEGORY_PRESETS[category] ?? []) : [];
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelected(next);
  }

  function goNext() {
    const cidParam = cardId ? `&cardId=${cardId}` : '';
    const catParam = category ? `&category=${category}` : '';
    const indices = Array.from(selected).join(',');
    router.push(`/wizard/benefit-form?context=card${cidParam}${catParam}&presets=${indices}`);
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-3">
        <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
          대상 가맹점 (선택)
        </Text>
        <Text className="text-body text-muted dark:text-muted-dark">
          추천 항목을 골라 미리 채울 수 있습니다. 건너뛰어도 됩니다.
        </Text>

        {presets.length === 0 ? (
          <Text className="text-body text-muted dark:text-muted-dark">
            이 카테고리에 추천 항목이 없습니다.
          </Text>
        ) : (
          <View className="gap-2">
            {presets.map((p, i) => (
              <Pressable
                key={`${p.group_label}-${i}`}
                onPress={() => toggle(i)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected.has(i) }}
                className={`rounded-md border p-3 ${
                  selected.has(i)
                    ? 'border-primary bg-primary/10'
                    : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark'
                }`}
              >
                <Text className="text-body font-medium text-foreground dark:text-foreground-dark">
                  {p.group_label}
                </Text>
                <Text className="text-label text-muted dark:text-muted-dark">{p.merchants}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View className="flex-row gap-2 mt-4">
          <View className="flex-1">
            <Button
              label="건너뛰기"
              variant="secondary"
              onPress={() => {
                setSelected(new Set());
                goNext();
              }}
            />
          </View>
          <View className="flex-1">
            <Button label="다음" onPress={goNext} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
