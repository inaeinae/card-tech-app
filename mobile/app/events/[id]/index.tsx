// 이벤트 상세 — Hero 상태 카드 + 타임라인 섹션 + 혜택 리스트 + sticky CTA
// Pencil frame z5SQd 기반 재설계
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Pencil, RefreshCw, Trash2 } from 'lucide-react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { supabase } from '@/lib/supabase';
import { useCardStore } from '@/stores/cardStore';
import { useEventStore } from '@/stores/eventStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useWizardStore } from '@/stores/wizardStore';
import { EVENT_STATUS_LABEL } from '@/types/models';
import type { Benefit, EventRow } from '@/types/models';
import { AutoSuggestionBanner } from '@/components/events/AutoSuggestionBanner';
import { suggestNextStatus } from '@/lib/eventStatus';
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

// 상태 도트/라벨 컬러 — 라이트/다크 토큰 매핑 (color-not-only: 텍스트 라벨 병기로 충족)
type ThemeC = (typeof Colors)[keyof typeof Colors];
function getStatusColor(status: string, C: ThemeC): string {
  switch (status) {
    case 'applied':
      return C.primary;
    case 'in_progress':
    case 'performance_done':
      return C.warning;
    case 'paid':
      return C.accent;
    case 'cancelable':
    case 'canceled':
      return C.danger;
    case 'registered':
    case 'pending_payout':
    default:
      return C.ink3;
  }
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];
  const eventInState = useEventStore((s) => s.events.find((e) => e.id === id));
  const deleteEvent = useEventStore((s) => s.deleteEvent);
  const changeStatus = useEventStore((s) => s.changeStatus);
  const card = useCardStore((s) => s.cards.find((c) => c.id === eventInState?.card_id));
  const loadFromEvent = useWizardStore((s) => s.loadFromEvent);

  const scheduled = useNotificationStore((s) => s.scheduled);
  const syncEventSchedule = useNotificationStore((s) => s.syncEventSchedule);
  const cancelEventSchedule = useNotificationStore((s) => s.cancelEventSchedule);
  const permission = useNotificationStore((s) => s.permission);
  const requestPermission = useNotificationStore((s) => s.requestPermission);

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

  const suggested = useMemo(() => {
    if (!event) return null;
    const today = new Date().toISOString().slice(0, 10);
    return suggestNextStatus(
      {
        status: event.status,
        apply_start: event.apply_start,
        apply_end: event.apply_end,
        use_start: event.use_start,
        use_end: event.use_end,
        payout_expected_at: event.payout_expected_at,
      },
      today,
    );
  }, [event]);

  const notifyEnabled = useMemo(
    () => scheduled.some((s) => s.event_id === event?.id && !s.canceled),
    [scheduled, event?.id],
  );

  async function onToggleNotify(value: boolean) {
    if (!event) return;
    try {
      if (value) {
        if (permission !== 'granted') {
          const result = await requestPermission();
          if (result !== 'granted') return;
        }
        await syncEventSchedule(event);
      } else {
        await cancelEventSchedule(event.id);
      }
    } catch (e) {
      Alert.alert('알림 설정 실패', e instanceof Error ? e.message : '알 수 없는 오류');
    }
  }

  async function onConfirmSuggested() {
    if (!event || !suggested) return;
    try {
      await changeStatus(event.id, suggested, true);
      setEvent({ ...event, status: suggested, status_updated_at: new Date().toISOString() });
    } catch (e) {
      Alert.alert('상태 변경 실패', e instanceof Error ? e.message : '알 수 없는 오류');
    }
  }

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

  if (loading) return <LoadingState />;
  if (!event) return <EmptyState title="이벤트를 찾을 수 없습니다" />;

  const dotColor = getStatusColor(event.status, C);

  const timelineRows = [
    { label: '응모', start: event.apply_start, end: event.apply_end },
    { label: '이용', start: event.use_start, end: event.use_end },
    {
      label: '지급 예정',
      start: event.payout_expected_at ?? event.payout_expected_period ?? null,
      end: null,
    },
  ];

  return (
    <SafeAreaScreen>
      {/* 상단 앱바 */}
      <View className="flex-row items-center px-2 h-14">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface dark:bg-surface-dark items-center justify-center active:opacity-80"
        >
          <ChevronLeft size={20} color={C.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Hero 상태 카드 */}
        <View className="items-center px-6 py-5 gap-2">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dotColor }} />
            <Text className="text-[15px] font-bold" style={{ color: dotColor }}>
              {EVENT_STATUS_LABEL[event.status]}
            </Text>
          </View>
          <Text className="text-[22px] font-bold text-ink dark:text-ink-dark text-center leading-[30px]">
            {event.title}
          </Text>
          {card ? (
            <Text className="text-label text-ink-3 dark:text-ink-3-dark">
              {card.issuer} · {card.name}
            </Text>
          ) : null}
        </View>

        {suggested && <AutoSuggestionBanner suggested={suggested} onConfirm={onConfirmSuggested} />}

        {/* 타임라인 섹션 */}
        <View className="mx-4 mb-3 p-4 rounded-lg border border-border-strong dark:border-border-strong-dark gap-3">
          {timelineRows.map((row) => (
            <View key={row.label} className="flex-row justify-between items-center">
              <Text className="text-[13px] font-medium text-ink-3 dark:text-ink-3-dark">
                {row.label}
              </Text>
              <Text className="text-[13px] font-semibold text-ink dark:text-ink-dark">
                {row.start ?? '-'}
                {row.end ? ` ~ ${row.end}` : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* 혜택 목록 */}
        <View className="mx-4 gap-2">
          <Text className="text-[16px] font-bold text-ink dark:text-ink-dark mb-1">
            혜택 {benefits.length}건
          </Text>
          {benefits.length === 0 ? (
            <EmptyState title="등록된 혜택이 없습니다" />
          ) : (
            benefits.map((b) => (
              <View
                key={b.id}
                className="p-4 rounded-lg border border-border-strong dark:border-border-strong-dark gap-1"
              >
                <Text className="text-[15px] font-semibold text-ink dark:text-ink-dark">
                  {b.title}
                </Text>
                <Text className="text-[13px] text-ink-3 dark:text-ink-3-dark">
                  예상 ₩{Number(b.expected_amount ?? 0).toLocaleString('ko-KR')}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* 합계 */}
        {benefits.length > 0 && (
          <View className="mx-4 mt-3 flex-row justify-between items-center pt-3 border-t border-border-strong dark:border-border-strong-dark">
            <Text className="text-label text-ink-3 dark:text-ink-3-dark">예상 수령 합계</Text>
            <Text className="text-[18px] font-bold text-ink dark:text-ink-dark">
              ₩{total.toLocaleString('ko-KR')}
            </Text>
          </View>
        )}

        {/* 이벤트별 알림 토글 */}
        <View className="flex-row items-center justify-between py-3 px-4 bg-surface dark:bg-surface-dark rounded-md mx-4 my-2">
          <Text className="text-label font-semibold text-ink dark:text-ink-dark">
            이 이벤트 알림
          </Text>
          <Switch
            value={notifyEnabled}
            onValueChange={onToggleNotify}
            accessibilityLabel="이 이벤트 알림 토글"
          />
        </View>

        {/* 상태 이력 링크 */}
        <Pressable
          onPress={() => router.push(`/events/${event.id}/history`)}
          className="items-center justify-center p-4 mt-1 active:opacity-60"
        >
          <Text className="text-label font-semibold text-primary dark:text-primary-dark">
            상태 이력 보기
          </Text>
        </Pressable>
      </ScrollView>

      {/* sticky CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-bg dark:bg-bg-dark border-t border-border-strong dark:border-border-strong-dark"
        style={{ padding: 24, paddingBottom: 36, gap: 10 }}
      >
        <Pressable
          onPress={() =>
            router.push(`/modals/status-change?id=${event.id}&current=${event.status}` as any)
          }
          className="flex-row items-center justify-center gap-1.5 bg-primary dark:bg-primary-dark rounded-lg py-3.5 active:opacity-80"
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text className="text-[15px] font-bold text-white">상태 변경</Text>
        </Pressable>
        <Pressable
          onPress={onEdit}
          className="flex-row items-center justify-center gap-1.5 bg-surface dark:bg-surface-dark rounded-lg py-3.5 border border-border-strong dark:border-border-strong-dark active:opacity-80"
        >
          <Pencil size={16} color={C.ink2} />
          <Text className="text-[15px] font-semibold text-ink-2 dark:text-ink-2-dark">수정</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          className="flex-row items-center justify-center gap-1.5 bg-bg dark:bg-bg-dark rounded-lg py-3.5 border border-danger-soft dark:border-danger-darkSoft active:opacity-80"
        >
          <Trash2 size={16} color={C.danger} />
          <Text className="text-[15px] font-semibold text-danger dark:text-danger-dark">삭제</Text>
        </Pressable>
      </View>
    </SafeAreaScreen>
  );
}
