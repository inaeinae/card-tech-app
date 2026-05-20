// 카드 수정 — 기존 값 로드 후 new 와 동일한 폼 재사용.
// 혜택은 즉시 반영(template-picker 경유 / 삭제 즉시 deleteCardBenefit) 정책 유지.
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IssuerSelect } from '@/components/ui/IssuerSelect';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardBenefitItem } from '@/components/cards/CardBenefitItem';
import { useAuthStore } from '@/stores/authStore';
import { useCardStore } from '@/stores/cardStore';
import { validateCardForm, normalizeCardForm, type CardFormErrors } from '@/lib/cardForm';
import { parseWon, formatWon } from '@/lib/formatWon';
import { CARD_TYPE_LABEL, type CardType } from '@/types/models';

// 카드 종류 라디오 옵션 — domestic/overseas 2종
const CARD_TYPE_OPTIONS: { value: CardType; label: string }[] = [
  { value: 'domestic', label: CARD_TYPE_LABEL.domestic },
  { value: 'overseas', label: CARD_TYPE_LABEL.overseas },
];

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const card = useCardStore((s) => s.cards.find((c) => c.id === id));
  const upsertCard = useCardStore((s) => s.upsertCard);
  const benefits = useCardStore((s) => s.benefits[id ?? ''] ?? []);
  const loadCardBenefits = useCardStore((s) => s.loadCardBenefits);
  const deleteCardBenefit = useCardStore((s) => s.deleteCardBenefit);

  const [issuer, setIssuer] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [cardType, setCardType] = useState<CardType | ''>('');
  const [annualFee, setAnnualFee] = useState('');
  const [baseMinSpend, setBaseMinSpend] = useState('');
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // 카드 로드 시 폼 state 초기화 — 신규 5필드 포함
  useEffect(() => {
    if (!card) return;
    setIssuer(card.issuer);
    setName(card.name);
    setNotes(card.notes ?? '');
    setCardType(card.card_type ?? '');
    setAnnualFee(formatWon(card.annual_fee_won));
    setBaseMinSpend(formatWon(card.base_min_spend_won));
  }, [card]);

  useEffect(() => {
    if (id) loadCardBenefits(id);
  }, [id, loadCardBenefits]);

  if (!card) return <EmptyState title="카드를 찾을 수 없습니다" />;

  async function onSubmit() {
    if (!user || !card) return;
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
      await upsertCard({
        id: card.id,
        user_id: user.id,
        issuer: input.issuer,
        name: input.name,
        notes: input.notes,
        card_type: input.card_type,
        annual_fee_won: input.annual_fee_won,
        base_min_spend_won: input.base_min_spend_won,
      });
      router.back();
    } catch (e) {
      Alert.alert('수정 실패', e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSubmitting(false);
    }
  }

  function goAddBenefit() {
    if (!id) return;
    router.push(`/wizard/template-picker?context=card&cardId=${id}`);
  }

  // 편집 화면의 혜택 삭제는 즉시 반영 — confirm Alert 후 deleteCardBenefit 호출
  function confirmDelete(benefitId: string) {
    Alert.alert('혜택 삭제', '삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => id && deleteCardBenefit(benefitId, id),
      },
    ]);
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
        <Input label="메모" value={notes} onChangeText={setNotes} multiline />

        <View className="gap-2">
          <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
            상시 혜택
          </Text>
          {benefits.map((b) => (
            <CardBenefitItem key={b.id} benefit={b} onDelete={() => confirmDelete(b.id)} />
          ))}
          <Pressable
            onPress={goAddBenefit}
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
