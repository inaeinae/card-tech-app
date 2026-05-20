// 카드 등록 — 카드사/이름/메모 + 카드종류/연회비/전월실적 + 상시혜택 draft (위저드 경유)
// 1) upsertCard 로 row 생성 → 반환된 card.id 확보
// 2) cardStore.draftBenefits 일괄 upsertCardBenefit
// 3) clearDraftBenefits + router.back()
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IssuerSelect } from '@/components/ui/IssuerSelect';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { CardBenefitItem } from '@/components/cards/CardBenefitItem';
import { useAuthStore } from '@/stores/authStore';
import { useCardStore } from '@/stores/cardStore';
import { validateCardForm, normalizeCardForm, type CardFormErrors } from '@/lib/cardForm';
import { parseWon } from '@/lib/formatWon';
import { CARD_TYPE_LABEL, type CardType } from '@/types/models';

// 카드 종류 라디오 옵션 — domestic/overseas 2종
const CARD_TYPE_OPTIONS: { value: CardType; label: string }[] = [
  { value: 'domestic', label: CARD_TYPE_LABEL.domestic },
  { value: 'overseas', label: CARD_TYPE_LABEL.overseas },
];

export default function NewCardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const upsertCard = useCardStore((s) => s.upsertCard);
  const upsertCardBenefit = useCardStore((s) => s.upsertCardBenefit);
  const draftBenefits = useCardStore((s) => s.draftBenefits);
  const removeDraftBenefit = useCardStore((s) => s.removeDraftBenefit);
  const clearDraftBenefits = useCardStore((s) => s.clearDraftBenefits);

  const [issuer, setIssuer] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [cardType, setCardType] = useState<CardType | ''>('');
  const [annualFee, setAnnualFee] = useState('');
  const [baseMinSpend, setBaseMinSpend] = useState('');
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // 화면 진입/이탈 시 draft 정리 — 다른 카드의 draft 가 남지 않도록
  useEffect(() => {
    clearDraftBenefits();
    return () => clearDraftBenefits();
  }, [clearDraftBenefits]);

  async function onSubmit() {
    if (!user) {
      Alert.alert('로그인이 필요합니다');
      return;
    }
    const input = normalizeCardForm({
      issuer,
      name,
      notes,
      card_type: (cardType || null) as CardType | null,
      annual_fee_won: parseWon(annualFee),
      base_min_spend_won: parseWon(baseMinSpend),
    });
    const formErrors = validateCardForm(input);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setSubmitting(true);
    try {
      const card = await upsertCard({
        user_id: user.id,
        issuer: input.issuer,
        name: input.name,
        notes: input.notes,
        card_type: input.card_type,
        annual_fee_won: input.annual_fee_won,
        base_min_spend_won: input.base_min_spend_won,
      });

      // draft 혜택 일괄 upsert — 정규화 모델(targets/cap_tiers 포함)
      for (const b of draftBenefits) {
        await upsertCardBenefit(card.id, {
          title: b.title,
          category: b.category,
          discount_pct: b.discount_pct,
          discount_method: b.discount_method,
          min_spend_won: b.min_spend_won,
          monthly_cap_won: b.monthly_cap_won,
          overseas_only: b.overseas_only,
          notes: b.notes,
          targets: b.targets,
          cap_tiers: b.cap_tiers,
        });
      }
      clearDraftBenefits();
      router.back();
    } catch (e) {
      Alert.alert('카드 저장 실패', e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-4">
        <IssuerSelect value={issuer} onChange={setIssuer} errorText={errors.issuer} />
        <Input
          label="카드명"
          required
          value={name}
          onChangeText={setName}
          placeholder="예: 바로 ZONE"
          errorText={errors.name}
        />
        <RadioGroup<CardType>
          label="카드 종류"
          required
          value={cardType}
          options={CARD_TYPE_OPTIONS}
          onChange={setCardType}
          errorText={errors.card_type}
        />
        <Input
          label="연회비 (원)"
          value={annualFee}
          onChangeText={setAnnualFee}
          keyboardType="number-pad"
          placeholder="0"
          errorText={errors.annual_fee_won}
        />
        <Input
          label="전월실적 (원)"
          value={baseMinSpend}
          onChangeText={setBaseMinSpend}
          keyboardType="number-pad"
          placeholder="0"
          errorText={errors.base_min_spend_won}
        />
        <Input
          label="메모"
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="카드 특이사항 (옵션)"
        />

        <View className="gap-2">
          <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
            상시 혜택
          </Text>
          {draftBenefits.map((b) => (
            <CardBenefitItem
              key={b.localId}
              benefit={{
                category: b.category,
                title: b.title,
                discount_pct: b.discount_pct,
                discount_method: b.discount_method,
                min_spend_won: b.min_spend_won,
                monthly_cap_won: b.monthly_cap_won,
                overseas_only: b.overseas_only,
                notes: b.notes,
                // draft 의 targets/cap_tiers 는 id 가 없음 → key 안정화를 위해 합성 id 부여
                targets: b.targets.map((t, i) => ({ ...t, id: `d${i}`, sort_order: i })),
                cap_tiers: b.cap_tiers.map((t, i) => ({ ...t, id: `d${i}`, sort_order: i })),
              }}
              onDelete={() => removeDraftBenefit(b.localId)}
            />
          ))}
          <Pressable
            onPress={() => router.push('/wizard/template-picker?context=card')}
            accessibilityRole="button"
            accessibilityLabel="혜택 추가"
            className="flex-row items-center justify-center gap-1.5 p-3 rounded-md border border-dashed border-primary"
          >
            <Plus size={16} />
            <Text className="text-body font-semibold text-primary">혜택 추가</Text>
          </Pressable>
        </View>

        <Button label="저장" onPress={onSubmit} loading={submitting} />
      </View>
    </ScrollView>
  );
}
