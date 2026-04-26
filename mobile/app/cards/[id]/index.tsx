// 카드 상세 — 상단 이미지 + 탭(상시혜택/이벤트이력) + 하단 액션
// 해지 액션: active → scheduleCancel, scheduled → confirmCancel/restoreCancel, canceled → restoreCancel
// design/UI_STRUCTURE.md §2.2 카드 상세 / §5.3 해지 흐름 참고
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pencil, XCircle, RotateCcw } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardBenefitItem } from '@/components/cards/CardBenefitItem';
import { useCardStore } from '@/stores/cardStore';
import { createCardImageSignedUrl } from '@/lib/cardImage';
import { computeCancelState } from '@/lib/cardCancel';

type Tab = 'benefits' | 'events';

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const card = useCardStore((s) => s.cards.find((c) => c.id === id));
  const benefits = useCardStore((s) => (id ? (s.benefits[id] ?? []) : []));
  const loadCardBenefits = useCardStore((s) => s.loadCardBenefits);
  const scheduleCancel = useCardStore((s) => s.scheduleCancel);
  const confirmCancel = useCardStore((s) => s.confirmCancel);
  const restoreCancel = useCardStore((s) => s.restoreCancel);

  const [tab, setTab] = useState<Tab>('benefits');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const cancelState = useMemo(
    () =>
      card
        ? computeCancelState({
            canceled_at: card.canceled_at,
            cancel_scheduled_at: card.cancel_scheduled_at,
          })
        : 'active',
    [card],
  );

  useEffect(() => {
    if (id) loadCardBenefits(id);
  }, [id, loadCardBenefits]);

  useEffect(() => {
    if (card?.image_path) {
      createCardImageSignedUrl(card.image_path)
        .then(setImageUrl)
        .catch(() => setImageUrl(null));
    } else {
      setImageUrl(null);
    }
  }, [card?.image_path]);

  if (!card) return <EmptyState title="카드를 찾을 수 없습니다" />;

  function onScheduleCancel() {
    if (!card) return;
    const cardId = card.id;
    Alert.alert(
      '해지 예약',
      '이 카드의 해지를 예약하시겠습니까? 실제 카드사 해지 전까지는 언제든 취소할 수 있습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '해지 예약',
          style: 'destructive',
          onPress: async () => {
            const today = new Date().toISOString().slice(0, 10);
            try {
              await scheduleCancel(cardId, today);
            } catch (e) {
              Alert.alert('해지 예약 실패', e instanceof Error ? e.message : '알 수 없는 오류');
            }
          },
        },
      ],
    );
  }

  function onConfirmCancel() {
    if (!card) return;
    const cardId = card.id;
    Alert.alert('해지 완료', '이 카드가 실제로 해지되었습니까? 되돌릴 수 있습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '해지 완료 기록',
        style: 'destructive',
        onPress: async () => {
          const today = new Date().toISOString().slice(0, 10);
          try {
            await confirmCancel(cardId, today);
          } catch (e) {
            Alert.alert('해지 기록 실패', e instanceof Error ? e.message : '알 수 없는 오류');
          }
        },
      },
    ]);
  }

  async function onRestoreCancel() {
    if (!card) return;
    try {
      await restoreCancel(card.id);
    } catch (e) {
      Alert.alert('복구 실패', e instanceof Error ? e.message : '알 수 없는 오류');
    }
  }

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-4">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', aspectRatio: 16 / 10, borderRadius: 12 }}
            contentFit="cover"
            accessibilityLabel={`${card.issuer} ${card.name} 카드 이미지`}
          />
        ) : (
          <View
            className="w-full rounded-md bg-surface dark:bg-surface-dark border border-border dark:border-border-dark items-center justify-center"
            style={{ aspectRatio: 16 / 10 }}
          >
            <Text className="text-muted dark:text-muted-dark">이미지 없음</Text>
          </View>
        )}

        <View className="gap-1">
          <Text className="text-label text-muted dark:text-muted-dark">{card.issuer}</Text>
          <Text className="text-title font-bold text-foreground dark:text-foreground-dark">
            {card.name}
          </Text>
          {cancelState === 'scheduled' && (
            <Text className="text-amber-700 dark:text-amber-300">
              해지 예약됨 — {card.cancel_scheduled_at}
            </Text>
          )}
          {cancelState === 'canceled' && (
            <Text className="text-destructive dark:text-destructive-dark">
              해지 완료 — {card.canceled_at}
            </Text>
          )}
          {card.notes ? (
            <Text className="text-body text-foreground dark:text-foreground-dark mt-2">
              {card.notes}
            </Text>
          ) : null}
        </View>

        <View className="flex-row gap-2">
          <TabButton
            active={tab === 'benefits'}
            onPress={() => setTab('benefits')}
            label="상시 혜택"
          />
          <TabButton
            active={tab === 'events'}
            onPress={() => setTab('events')}
            label="이벤트 이력"
          />
        </View>

        {tab === 'benefits' ? (
          benefits.length === 0 ? (
            <EmptyState title="등록된 상시 혜택이 없습니다" />
          ) : (
            <FlatList
              scrollEnabled={false}
              data={benefits}
              keyExtractor={(b) => b.id}
              renderItem={({ item }) => <CardBenefitItem benefit={item} />}
              ItemSeparatorComponent={() => <View className="h-2" />}
            />
          )
        ) : (
          <EmptyState title="이 카드로 등록된 이벤트가 없습니다" />
        )}

        <View className="gap-2 mt-4">
          <Button
            label="카드 수정"
            variant="secondary"
            leftIcon={<Pencil size={16} color="#94A3B8" />}
            onPress={() => router.push(`/cards/${card.id}/edit`)}
          />
          {cancelState === 'active' && (
            <Button
              label="해지 예약"
              variant="destructive"
              leftIcon={<XCircle size={16} color="#FFFFFF" />}
              onPress={onScheduleCancel}
            />
          )}
          {cancelState === 'scheduled' && (
            <>
              <Button label="해지 완료 기록" variant="destructive" onPress={onConfirmCancel} />
              <Button
                label="해지 예약 취소"
                variant="secondary"
                leftIcon={<RotateCcw size={16} color="#94A3B8" />}
                onPress={onRestoreCancel}
              />
            </>
          )}
          {cancelState === 'canceled' && (
            <Button
              label="해지 되돌리기"
              variant="secondary"
              leftIcon={<RotateCcw size={16} color="#94A3B8" />}
              onPress={onRestoreCancel}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      hitSlop={8}
      className={`flex-1 h-11 items-center justify-center rounded-md ${
        active
          ? 'bg-primary dark:bg-primary-dark'
          : 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark'
      }`}
    >
      <Text
        className={`text-body font-medium ${
          active ? 'text-white' : 'text-foreground dark:text-foreground-dark'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
