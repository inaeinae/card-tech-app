// 카드 등록 — 카드사(셀렉트)/이름/메모 + 상시혜택 draft (위저드 경유)
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
import { CardBenefitItem } from '@/components/cards/CardBenefitItem';
import { useAuthStore } from '@/stores/authStore';
import { useCardStore } from '@/stores/cardStore';
import { validateCardForm, normalizeCardForm, type CardFormErrors } from '@/lib/cardForm';

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
    const normalized = normalizeCardForm({ issuer, name, notes });
    const formErrors = validateCardForm(normalized);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setSubmitting(true);
    try {
      const card = await upsertCard({
        user_id: user.id,
        issuer: normalized.issuer,
        name: normalized.name,
        notes: normalized.notes,
      });

      for (const b of draftBenefits) {
        await upsertCardBenefit(card.id, { title: b.title, details: b.details ?? null });
      }
      clearDraftBenefits();
      router.back();
    } catch (e) {
      Alert.alert('카드 저장 실패', e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSubmitting(false);
    }
  }

  function goAddBenefit() {
    router.push('/wizard/template-picker?context=card');
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
        <Input
          label="메모"
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="카드 특이사항 (옵션)"
        />

        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#191F28' }}>상시 혜택</Text>
          {draftBenefits.map((b) => (
            <CardBenefitItem
              key={b.localId}
              title={b.title}
              details={b.details ?? null}
              onDelete={() => removeDraftBenefit(b.localId)}
            />
          ))}
          <Pressable
            onPress={goAddBenefit}
            accessibilityRole="button"
            accessibilityLabel="혜택 추가"
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed',
              borderColor: '#3182F6',
            }}
          >
            <Plus size={16} color="#3182F6" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#3182F6' }}>혜택 추가</Text>
          </Pressable>
        </View>

        <Button label="저장" onPress={onSubmit} loading={submitting} />
      </View>
    </ScrollView>
  );
}
