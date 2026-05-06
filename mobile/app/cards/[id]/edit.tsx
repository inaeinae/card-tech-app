// 카드 수정 — 기존 값 로드 후 new 와 동일한 폼 재사용
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { IssuerSelect } from '@/components/ui/IssuerSelect';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { useCardStore } from '@/stores/cardStore';
import { validateCardForm, normalizeCardForm, type CardFormErrors } from '@/lib/cardForm';

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const card = useCardStore((s) => s.cards.find((c) => c.id === id));
  const upsertCard = useCardStore((s) => s.upsertCard);
  const benefits = useCardStore((s) => s.benefits[id ?? ''] ?? []);
  const loadCardBenefits = useCardStore((s) => s.loadCardBenefits);
  const upsertCardBenefit = useCardStore((s) => s.upsertCardBenefit);
  const deleteCardBenefit = useCardStore((s) => s.deleteCardBenefit);

  const [issuer, setIssuer] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!card) return;
    setIssuer(card.issuer);
    setName(card.name);
    setNotes(card.notes ?? '');
  }, [card]);

  useEffect(() => {
    if (id) loadCardBenefits(id);
  }, [id, loadCardBenefits]);

  if (!card) return <EmptyState title="카드를 찾을 수 없습니다" />;

  async function onSubmit() {
    if (!user || !card) return;
    const normalized = normalizeCardForm({ issuer, name, notes });
    const formErrors = validateCardForm(normalized);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setSubmitting(true);
    try {
      await upsertCard({
        id: card.id,
        user_id: user.id,
        issuer: normalized.issuer,
        name: normalized.name,
        notes: normalized.notes,
      });
      router.back();
    } catch (e) {
      Alert.alert('수정 실패', e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSubmitting(false);
    }
  }

  function addBenefit() {
    Alert.prompt('혜택 추가', '혜택 이름을 입력하세요', async (title) => {
      if (title?.trim() && id) await upsertCardBenefit(id, { title: title.trim() });
    });
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
        <Input label="메모" value={notes} onChangeText={setNotes} multiline />

        {/* 상시 혜택 섹션 */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#191F28' }}>상시 혜택</Text>
          {benefits.map((b) => (
            <View
              key={b.id}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                padding: 12, borderRadius: 12,
                borderWidth: 1, borderColor: '#E5E8EB',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#191F28' }}>{b.title}</Text>
                {b.details ? <Text style={{ fontSize: 13, color: '#8B95A1' }}>{String(b.details)}</Text> : null}
              </View>
              <Pressable
                onPress={() => {
                  Alert.alert('혜택 삭제', '삭제하시겠습니까?', [
                    { text: '취소', style: 'cancel' },
                    { text: '삭제', style: 'destructive', onPress: () => id && deleteCardBenefit(b.id, id) },
                  ]);
                }}
                accessibilityLabel="혜택 삭제"
              >
                <Trash2 size={18} color="#FF4D4F" />
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={addBenefit}
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
