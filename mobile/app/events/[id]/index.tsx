// 이벤트 상세 — 상태 배지 + 일정 요약 + 혜택 리스트 + 수정/삭제.
// "이력 보기" / "상태 변경" 은 Phase 7 에서 활성화.
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pencil, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { supabase } from '@/lib/supabase';
import { useCardStore } from '@/stores/cardStore';
import { useEventStore } from '@/stores/eventStore';
import { useWizardStore } from '@/stores/wizardStore';
import type { Benefit, EventRow } from '@/types/models';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const eventInState = useEventStore((s) => s.events.find((e) => e.id === id));
  const deleteEvent = useEventStore((s) => s.deleteEvent);
  const card = useCardStore((s) => s.cards.find((c) => c.id === eventInState?.card_id));
  const loadFromEvent = useWizardStore((s) => s.loadFromEvent);

  const [event, setEvent] = useState<EventRow | null>(eventInState ?? null);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      setLoading(true);
      const [{ data: ev }, { data: bs }] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).single(),
        supabase
          .from('benefits')
          .select('*')
          .eq('event_id', id)
          .order('created_at', { ascending: true }),
      ]);
      if (!alive) return;
      setEvent(ev ?? null);
      setBenefits(bs ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const total = useMemo(
    () => benefits.reduce((acc, b) => acc + Number(b.expected_amount ?? 0), 0),
    [benefits],
  );

  async function onEdit() {
    if (!event) return;
    await loadFromEvent(event.id);
    router.push('/wizard/step-info');
  }

  function onDelete() {
    if (!event) return;
    Alert.alert('이벤트 삭제', '이 이벤트와 모든 혜택·이력이 영구 삭제됩니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(event.id);
            router.back();
          } catch (e) {
            Alert.alert('삭제 실패', e instanceof Error ? e.message : '알 수 없는 오류');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
        <Text className="text-muted dark:text-muted-dark">불러오는 중…</Text>
      </View>
    );
  }
  if (!event) return <EmptyState title="이벤트를 찾을 수 없습니다" />;

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-3">
        <StatusBadge status={event.status} />
        <Text className="text-title font-bold text-foreground dark:text-foreground-dark">
          {event.title}
        </Text>
        {card ? (
          <Text className="text-label text-muted dark:text-muted-dark">
            {card.issuer} · {card.name}
          </Text>
        ) : null}

        <View className="rounded-md p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark gap-1">
          <Text className="text-label text-muted dark:text-muted-dark">
            응모 {event.apply_start ?? '-'} ~ {event.apply_end ?? '-'}
          </Text>
          <Text className="text-label text-muted dark:text-muted-dark">
            이용 {event.use_start ?? '-'} ~ {event.use_end ?? '-'}
          </Text>
          {event.payout_expected_at ? (
            <Text className="text-label text-muted dark:text-muted-dark">
              지급 예정 {event.payout_expected_at}
            </Text>
          ) : event.payout_expected_period ? (
            <Text className="text-label text-muted dark:text-muted-dark">
              지급 예정 {event.payout_expected_period}
            </Text>
          ) : null}
        </View>

        <Text className="text-headline font-bold text-foreground dark:text-foreground-dark mt-2">
          혜택 {benefits.length}건
        </Text>
        <FlatList
          scrollEnabled={false}
          data={benefits}
          keyExtractor={(b) => b.id}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <View className="rounded-md p-3 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
              <Text className="text-body font-medium text-foreground dark:text-foreground-dark">
                {item.title}
              </Text>
              <Text className="text-label text-muted dark:text-muted-dark">
                예상 ₩{Number(item.expected_amount ?? 0).toLocaleString('ko-KR')}
              </Text>
            </View>
          )}
        />

        <View className="flex-row justify-between mt-2 pt-2 border-t border-border dark:border-border-dark">
          <Text className="text-body text-muted dark:text-muted-dark">예상 수령 합계</Text>
          <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
            ₩{total.toLocaleString('ko-KR')}
          </Text>
        </View>

        <View className="gap-2 mt-4">
          <Button
            label="수정"
            variant="secondary"
            leftIcon={<Pencil size={16} color="#94A3B8" />}
            onPress={onEdit}
          />
          <Button
            label="삭제"
            variant="destructive"
            leftIcon={<Trash2 size={16} color="#FFFFFF" />}
            onPress={onDelete}
          />
        </View>
      </View>
    </ScrollView>
  );
}
