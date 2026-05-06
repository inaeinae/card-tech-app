// 카드 등록 — 카드사/이름/메모 + 이미지 업로드 + 상시혜택 draft
// 1) upsertCard 로 row 생성(이미지 경로 없이) → 반환된 card.id 확보
// 2) 이미지가 있으면 uploadCardImage(userId, card.id) 후 image_path 로 재 upsert
// 3) draftBenefits 일괄 upsertCardBenefit
// 4) router.back() 으로 이전 화면 복귀
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CardImagePicker } from '@/components/cards/CardImagePicker';
import { useAuthStore } from '@/stores/authStore';
import { useCardStore } from '@/stores/cardStore';
import { validateCardForm, normalizeCardForm, type CardFormErrors } from '@/lib/cardForm';
import { uploadCardImage } from '@/lib/cardImage';

type DraftBenefit = { localId: string; title: string; details?: string };

export default function NewCardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const upsertCard = useCardStore((s) => s.upsertCard);

  const [issuer, setIssuer] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [draftBenefits, setDraftBenefits] = useState<DraftBenefit[]>([]);

  async function onSubmit() {
    if (!user) {
      Alert.alert('로그인이 필요합니다');
      return;
    }
    const raw = { issuer, name, notes };
    const normalized = normalizeCardForm(raw);
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

      if (imageUri) {
        const { path } = await uploadCardImage({
          userId: user.id,
          cardId: card.id,
          fileUri: imageUri,
          extension: 'jpg',
        });
        await upsertCard({ id: card.id, image_path: path });
      }

      // 상시혜택 일괄 저장
      for (const b of draftBenefits) {
        await useCardStore.getState().upsertCardBenefit(card.id, { title: b.title, details: b.details });
      }

      router.back();
    } catch (e) {
      Alert.alert('카드 저장 실패', e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSubmitting(false);
    }
  }

  function addBenefit() {
    // Alert.prompt는 iOS 전용
    Alert.prompt('혜택 추가', '혜택 이름을 입력하세요', (title) => {
      if (title?.trim()) {
        setDraftBenefits((prev) => [
          ...prev,
          { localId: Date.now().toString(), title: title.trim() },
        ]);
      }
    });
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-4">
        <CardImagePicker value={imageUri} onChange={setImageUri} />
        <Input
          label="카드사"
          required
          value={issuer}
          onChangeText={setIssuer}
          placeholder="예: 비씨카드"
          errorText={errors.issuer}
        />
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

        {/* 상시 혜택 섹션 */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#191F28' }}>상시 혜택</Text>
          {draftBenefits.map((b) => (
            <View
              key={b.localId}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 8,
                padding: 12, borderRadius: 12,
                borderWidth: 1, borderColor: '#E5E8EB',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#191F28' }}>{b.title}</Text>
                {b.details ? <Text style={{ fontSize: 13, color: '#8B95A1' }}>{b.details}</Text> : null}
              </View>
              <Pressable
                onPress={() => setDraftBenefits((prev) => prev.filter((x) => x.localId !== b.localId))}
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
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#3182F6' }}>+ 혜택 추가</Text>
          </Pressable>
        </View>

        <Button label="저장" onPress={onSubmit} loading={submitting} />
      </View>
    </ScrollView>
  );
}
