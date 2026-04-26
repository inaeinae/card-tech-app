// 카드 수정 — 기존 값 로드 후 new 와 동일한 폼 재사용
// imageDirty 플래그로 이미지 변경 여부 구분 (변경 없으면 image_path 그대로 유지)
import { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CardImagePicker } from '@/components/cards/CardImagePicker';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/stores/authStore';
import { useCardStore } from '@/stores/cardStore';
import { validateCardForm, normalizeCardForm, type CardFormErrors } from '@/lib/cardForm';
import { uploadCardImage, createCardImageSignedUrl } from '@/lib/cardImage';

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const card = useCardStore((s) => s.cards.find((c) => c.id === id));
  const upsertCard = useCardStore((s) => s.upsertCard);

  const [issuer, setIssuer] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageDirty, setImageDirty] = useState(false);
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!card) return;
    setIssuer(card.issuer);
    setName(card.name);
    setNotes(card.notes ?? '');
    if (card.image_path) {
      createCardImageSignedUrl(card.image_path)
        .then(setImageUri)
        .catch(() => setImageUri(null));
    }
  }, [card]);

  if (!card) return <EmptyState title="카드를 찾을 수 없습니다" />;

  async function onSubmit() {
    if (!user || !card) return;
    const normalized = normalizeCardForm({ issuer, name, notes });
    const formErrors = validateCardForm(normalized);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setSubmitting(true);
    try {
      let image_path: string | null = card.image_path;
      if (imageDirty && imageUri) {
        const { path } = await uploadCardImage({
          userId: user.id,
          cardId: card.id,
          fileUri: imageUri,
          extension: 'jpg',
        });
        image_path = path;
      } else if (imageDirty && !imageUri) {
        image_path = null;
      }

      await upsertCard({
        id: card.id,
        user_id: user.id,
        issuer: normalized.issuer,
        name: normalized.name,
        notes: normalized.notes,
        image_path,
      });
      router.back();
    } catch (e) {
      Alert.alert('수정 실패', e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-4">
        <CardImagePicker
          value={imageUri}
          onChange={(uri) => {
            setImageUri(uri);
            setImageDirty(true);
          }}
        />
        <Input
          label="카드사"
          required
          value={issuer}
          onChangeText={setIssuer}
          errorText={errors.issuer}
        />
        <Input
          label="카드명"
          required
          value={name}
          onChangeText={setName}
          errorText={errors.name}
        />
        <Input label="메모" value={notes} onChangeText={setNotes} multiline />
        <Button label="저장" onPress={onSubmit} loading={submitting} />
      </View>
    </ScrollView>
  );
}
