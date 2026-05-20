// 단일 혜택 편집 폼 — 컨텍스트별 분기.
// context=card 면 카드 상시혜택 풀폼(CardBenefitForm) 렌더.
// 그 외(이벤트 위저드) 는 기존 단순 폼(EventBenefitForm) 그대로 유지.
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import {
  BENEFIT_CATEGORIES,
  CATEGORY_PRESETS,
  getCategoryById,
  getTemplateById,
} from '@/lib/templates';
import { formatWon, parseWon } from '@/lib/formatWon';
import { normalizeBenefit, validateBenefit, type BenefitFormInput } from '@/lib/benefitForm';
import { DISCOUNT_METHOD_LABEL, type DiscountMethod } from '@/types/models';
import { useCardStore } from '@/stores/cardStore';
import { useWizardStore } from '@/stores/wizardStore';

// 할인 방식 Select 옵션 — DISCOUNT_METHOD_LABEL 의 한글 라벨 매핑
const METHOD_OPTIONS: readonly SelectOption<DiscountMethod>[] = (
  Object.keys(DISCOUNT_METHOD_LABEL) as DiscountMethod[]
).map((k) => ({ value: k, label: DISCOUNT_METHOD_LABEL[k] }));

// 카테고리 Select 옵션 — 카드 카테고리 id/label 매핑
const CATEGORY_OPTIONS: readonly SelectOption<string>[] = BENEFIT_CATEGORIES.map((c) => ({
  value: c.id,
  label: c.label,
}));

export default function BenefitForm() {
  const params = useLocalSearchParams<{
    templateId?: string;
    tempId?: string;
    context?: string;
    cardId?: string;
    category?: string;
    presets?: string;
  }>();
  const isCardContext = params.context === 'card';

  if (isCardContext) {
    return (
      <CardBenefitForm cardId={params.cardId} category={params.category} presets={params.presets} />
    );
  }
  return <EventBenefitForm templateId={params.templateId} tempId={params.tempId} />;
}

// 카드 컨텍스트 풀폼 — 정규화 모델(BenefitFormInput) 기반.
function CardBenefitForm({
  cardId,
  category,
  presets,
}: {
  cardId?: string;
  category?: string;
  presets?: string;
}) {
  const router = useRouter();
  const addDraftBenefit = useCardStore((s) => s.addDraftBenefit);
  const upsertCardBenefit = useCardStore((s) => s.upsertCardBenefit);

  // 시드 targets — category + presets 인덱스로 CATEGORY_PRESETS 슬라이스
  const seedTargets = useMemo(() => {
    if (!category) return [];
    const presetGroups = CATEGORY_PRESETS[category] ?? [];
    if (!presets) return [];
    const indices = presets
      .split(',')
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => Number.isInteger(n) && n >= 0 && n < presetGroups.length);
    return indices.map((i, sortIdx) => ({
      group_label: presetGroups[i].group_label,
      merchants: presetGroups[i].merchants,
      sort_order: sortIdx,
    }));
  }, [category, presets]);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string>(category ?? '');
  const [discountPct, setDiscountPct] = useState('');
  const [discountMethod, setDiscountMethod] = useState<DiscountMethod | ''>('');
  const [minSpend, setMinSpend] = useState('');
  // 한도 모드: 'single' = 단일 monthly_cap_won, 'tiered' = cap_tiers 배열
  const [capMode, setCapMode] = useState<'single' | 'tiered'>('single');
  const [monthlyCap, setMonthlyCap] = useState('');
  const [tiers, setTiers] = useState<{ min_spend_won: string; cap_won: string }[]>([]);
  const [targets, setTargets] = useState<{ group_label: string; merchants: string }[]>(
    seedTargets.map((t) => ({ group_label: t.group_label, merchants: t.merchants })),
  );
  const [overseasOnly, setOverseasOnly] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 카테고리 기본 라벨 — getCategoryById 로 helperText 노출용
  const defaultCategoryLabel = useMemo(
    () => (category ? (getCategoryById(category)?.label ?? null) : null),
    [category],
  );

  function addTier() {
    setTiers((prev) => [...prev, { min_spend_won: '', cap_won: '' }]);
    setCapMode('tiered');
  }

  function patchTier(idx: number, key: 'min_spend_won' | 'cap_won', raw: string) {
    setTiers((prev) => prev.map((t, i) => (i === idx ? { ...t, [key]: raw } : t)));
  }

  function removeTier(idx: number) {
    setTiers((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0) setCapMode('single');
      return next;
    });
  }

  function addTarget() {
    setTargets((prev) => [...prev, { group_label: '', merchants: '' }]);
  }

  function patchTarget(idx: number, key: 'group_label' | 'merchants', raw: string) {
    setTargets((prev) => prev.map((t, i) => (i === idx ? { ...t, [key]: raw } : t)));
  }

  function removeTarget(idx: number) {
    setTargets((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSave() {
    // 입력 → BenefitFormInput 변환
    const input: BenefitFormInput = {
      title,
      category: categoryId.length > 0 ? categoryId : null,
      discount_pct: discountPct.trim().length > 0 ? Number(discountPct) : null,
      discount_method: discountMethod === '' ? null : discountMethod,
      min_spend_won: parseWon(minSpend),
      monthly_cap_won: capMode === 'single' ? parseWon(monthlyCap) : null,
      overseas_only: overseasOnly,
      notes,
      targets: targets.map((t, i) => ({
        group_label: t.group_label,
        merchants: t.merchants,
        sort_order: i,
      })),
      cap_tiers:
        capMode === 'tiered'
          ? tiers.map((t, i) => ({
              min_spend_won: parseWon(t.min_spend_won) ?? 0,
              cap_won: parseWon(t.cap_won) ?? 0,
              sort_order: i,
            }))
          : [],
    };

    const normalized = normalizeBenefit(input);
    const validationErrors = validateBenefit(normalized);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors as Record<string, string>);
      const msg = Object.values(validationErrors).join('\n');
      Alert.alert('입력 확인', msg);
      return;
    }
    setErrors({});

    try {
      if (cardId) {
        await upsertCardBenefit(cardId, normalized);
      } else {
        addDraftBenefit(normalized);
      }
      router.back();
    } catch (e) {
      const msg = e instanceof Error ? e.message : '저장 중 오류가 발생했습니다.';
      Alert.alert('저장 실패', msg);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-4">
        <Input
          label="제목"
          required
          value={title}
          onChangeText={setTitle}
          errorText={errors.title}
          placeholder="예: 생활잡화 5% 할인"
        />

        <Select
          label="카테고리"
          value={categoryId}
          options={CATEGORY_OPTIONS}
          onChange={(v) => setCategoryId(v)}
          helperText={defaultCategoryLabel ? `기본: ${defaultCategoryLabel}` : undefined}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="할인율 (%)"
              value={discountPct}
              onChangeText={setDiscountPct}
              keyboardType="number-pad"
              placeholder="0"
              errorText={errors.discount_pct}
            />
          </View>
          <View className="flex-1">
            <Select
              label="할인 방식"
              value={discountMethod}
              options={METHOD_OPTIONS}
              onChange={(v) => setDiscountMethod(v)}
            />
          </View>
        </View>

        <Input
          label="혜택 전월실적 (원)"
          value={minSpend}
          onChangeText={setMinSpend}
          keyboardType="number-pad"
          placeholder="0"
          errorText={errors.min_spend_won}
          helperText={parseWon(minSpend) ? formatWon(parseWon(minSpend)) + ' 원' : undefined}
        />

        {/* 월 한도 — tiers 비어있으면 단일 입력, 있으면 cap_tier 행 반복 */}
        <View className="gap-2">
          <Text className="text-label font-medium text-foreground dark:text-foreground-dark">
            월 한도
          </Text>
          {capMode === 'single' && tiers.length === 0 ? (
            <Input
              label="단일 월 한도 (원)"
              value={monthlyCap}
              onChangeText={setMonthlyCap}
              keyboardType="number-pad"
              placeholder="0"
              errorText={errors.monthly_cap_won}
              helperText={
                parseWon(monthlyCap) ? formatWon(parseWon(monthlyCap)) + ' 원' : undefined
              }
            />
          ) : (
            <View className="gap-2">
              {tiers.map((t, idx) => (
                <View
                  key={`tier-${idx}`}
                  className="flex-row items-end gap-2 p-3 rounded-md bg-surface dark:bg-surface-dark border border-border dark:border-border-dark"
                >
                  <View className="flex-1">
                    <Input
                      label="전월실적 (원)"
                      value={t.min_spend_won}
                      onChangeText={(v) => patchTier(idx, 'min_spend_won', v)}
                      keyboardType="number-pad"
                      placeholder="0"
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label="월 한도 (원)"
                      value={t.cap_won}
                      onChangeText={(v) => patchTier(idx, 'cap_won', v)}
                      keyboardType="number-pad"
                      placeholder="0"
                    />
                  </View>
                  <Pressable
                    onPress={() => removeTier(idx)}
                    accessibilityRole="button"
                    accessibilityLabel="구간 삭제"
                    className="h-12 w-12 items-center justify-center"
                    hitSlop={8}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
              {errors.cap_tiers ? (
                <Text className="text-caption text-destructive dark:text-destructive-dark">
                  {errors.cap_tiers}
                </Text>
              ) : null}
            </View>
          )}
          <Pressable
            onPress={addTier}
            accessibilityRole="button"
            accessibilityLabel="구간 추가"
            className="flex-row items-center gap-1 self-start py-2"
            hitSlop={8}
          >
            <Plus size={16} color="#1E40AF" />
            <Text className="text-label font-medium text-primary dark:text-primary-dark">
              구간 추가
            </Text>
          </Pressable>
        </View>

        {/* 대상 구분 (group_label + merchants) 행 반복 */}
        <View className="gap-2">
          <Text className="text-label font-medium text-foreground dark:text-foreground-dark">
            대상 구분
          </Text>
          {targets.map((t, idx) => (
            <View
              key={`target-${idx}`}
              className="gap-2 p-3 rounded-md bg-surface dark:bg-surface-dark border border-border dark:border-border-dark"
            >
              <View className="flex-row items-end gap-2">
                <View className="flex-1">
                  <Input
                    label="구분명"
                    value={t.group_label}
                    onChangeText={(v) => patchTarget(idx, 'group_label', v)}
                    placeholder="예: 생활잡화"
                  />
                </View>
                <Pressable
                  onPress={() => removeTarget(idx)}
                  accessibilityRole="button"
                  accessibilityLabel="대상 구분 삭제"
                  className="h-12 w-12 items-center justify-center"
                  hitSlop={8}
                >
                  <Trash2 size={18} color="#EF4444" />
                </Pressable>
              </View>
              <Input
                label="가맹점"
                value={t.merchants}
                onChangeText={(v) => patchTarget(idx, 'merchants', v)}
                placeholder="예: 다이소, 알라딘"
              />
            </View>
          ))}
          {errors.targets ? (
            <Text className="text-caption text-destructive dark:text-destructive-dark">
              {errors.targets}
            </Text>
          ) : null}
          <Pressable
            onPress={addTarget}
            accessibilityRole="button"
            accessibilityLabel="대상 구분 추가"
            className="flex-row items-center gap-1 self-start py-2"
            hitSlop={8}
          >
            <Plus size={16} color="#1E40AF" />
            <Text className="text-label font-medium text-primary dark:text-primary-dark">
              구분 추가
            </Text>
          </Pressable>
        </View>

        {/* 해외겸용 한정 토글 — Chip 으로 on/off */}
        <View className="gap-1.5">
          <Text className="text-label font-medium text-foreground dark:text-foreground-dark">
            해외 사용 한정
          </Text>
          <View className="flex-row gap-2">
            <Chip
              label="해외겸용 한정"
              tone="overseas"
              selected={overseasOnly}
              onPress={() => setOverseasOnly((v) => !v)}
            />
          </View>
        </View>

        <Input
          label="제외 / 특이사항 메모"
          value={notes}
          onChangeText={setNotes}
          placeholder="예: 백화점·대형마트 제외"
          multiline
          style={{ height: 96, textAlignVertical: 'top', paddingTop: 12 }}
        />

        <Button label="저장" onPress={onSave} />
      </View>
    </ScrollView>
  );
}

// 이벤트 위저드 컨텍스트 — 기존 단순 폼 그대로 보존.
function EventBenefitForm({ templateId, tempId }: { templateId?: string; tempId?: string }) {
  const router = useRouter();
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
    const trimmed = label.trim();
    if (!trimmed) return;

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
