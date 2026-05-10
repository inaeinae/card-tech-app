// 이벤트 상세 — Hero 상태 카드 + 타임라인 섹션 + 혜택 리스트 + sticky CTA
// Pencil frame z5SQd 기반 재설계
import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Pressable, SafeAreaView, ScrollView, Text, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Pencil, RefreshCw, Trash2 } from 'lucide-react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { supabase } from '@/lib/supabase';
import { useCardStore } from '@/stores/cardStore';
import { useEventStore } from '@/stores/eventStore';
import { useWizardStore } from '@/stores/wizardStore';
import { EVENT_STATUS_LABEL } from '@/types/models';
import type { Benefit, EventRow } from '@/types/models';
import { AutoSuggestionBanner } from '@/components/events/AutoSuggestionBanner';
import { suggestNextStatus } from '@/lib/eventStatus';

const STATUS_COLOR: Record<string, string> = {
  registered: '#8B95A1',
  applied: '#3182F6',
  in_progress: '#F59E0B',
  performance_done: '#F59E0B',
  pending_payout: '#8B95A1',
  paid: '#19D294',
  cancelable: '#FF4D4F',
  canceled: '#FF4D4F',
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const eventInState = useEventStore((s) => s.events.find((e) => e.id === id));
  const deleteEvent = useEventStore((s) => s.deleteEvent);
  const changeStatus = useEventStore((s) => s.changeStatus);
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
    return () => { alive = false; };
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

  async function onConfirmSuggested() {
    if (!event || !suggested) return;
    await changeStatus(event.id, suggested, true);
    setEvent({ ...event, status: suggested, status_updated_at: new Date().toISOString() });
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

  const dotColor = STATUS_COLOR[event.status] ?? '#8B95A1';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* 상단 앱바 */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 8, height: 56,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color="#191F28" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Hero 상태 카드 */}
        <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dotColor }} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: dotColor }}>
              {EVENT_STATUS_LABEL[event.status]}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 22, fontWeight: '700', color: '#191F28',
              textAlign: 'center', lineHeight: 30,
            }}
          >
            {event.title}
          </Text>
          {card ? (
            <Text style={{ fontSize: 14, color: '#8B95A1' }}>
              {card.issuer} · {card.name}
            </Text>
          ) : null}
        </View>

        {suggested && (
          <AutoSuggestionBanner suggested={suggested} onConfirm={onConfirmSuggested} />
        )}

        {/* 타임라인 섹션 */}
        <View
          style={{
            marginHorizontal: 16, marginBottom: 12, padding: 16,
            borderRadius: 18, borderWidth: 1, borderColor: '#E5E8EB', gap: 12,
          }}
        >
          {timelineRows.map((row) => (
            <View
              key={row.label}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 13, color: '#8B95A1', fontWeight: '500' }}>{row.label}</Text>
              <Text style={{ fontSize: 13, color: '#191F28', fontWeight: '600' }}>
                {row.start ?? '-'}{row.end ? ` ~ ${row.end}` : ''}
              </Text>
            </View>
          ))}
        </View>

        {/* 혜택 목록 */}
        <View style={{ marginHorizontal: 16, gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#191F28', marginBottom: 4 }}>
            혜택 {benefits.length}건
          </Text>
          {benefits.length === 0 ? (
            <EmptyState title="등록된 혜택이 없습니다" />
          ) : (
            benefits.map((b) => (
              <View
                key={b.id}
                style={{
                  padding: 16, borderRadius: 18,
                  borderWidth: 1, borderColor: '#E5E8EB', gap: 4,
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#191F28' }}>{b.title}</Text>
                <Text style={{ fontSize: 13, color: '#8B95A1' }}>
                  예상 ₩{Number(b.expected_amount ?? 0).toLocaleString('ko-KR')}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* 합계 */}
        {benefits.length > 0 && (
          <View
            style={{
              marginHorizontal: 16, marginTop: 12,
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E8EB',
            }}
          >
            <Text style={{ fontSize: 14, color: '#8B95A1' }}>예상 수령 합계</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#191F28' }}>
              ₩{total.toLocaleString('ko-KR')}
            </Text>
          </View>
        )}

        {/* 상태 이력 링크 */}
        <Pressable
          onPress={() => router.push(`/events/${event.id}/history`)}
          style={{ alignItems: 'center', justifyContent: 'center', padding: 16, marginTop: 4 }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#3182F6' }}>상태 이력 보기</Text>
        </Pressable>
      </ScrollView>

      {/* sticky CTA */}
      <View
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E8EB',
          padding: 24, paddingBottom: 36, gap: 10,
        }}
      >
        <Pressable
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress={() => router.push(`/modals/status-change?id=${event.id}&current=${event.status}` as any)}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
            backgroundColor: pressed ? '#1B64DA' : '#3182F6',
            borderRadius: 14, paddingVertical: 14,
          })}
        >
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>상태 변경</Text>
        </Pressable>
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
            backgroundColor: pressed ? '#F2F4F6' : '#F9FAFB',
            borderRadius: 14, paddingVertical: 14,
            borderWidth: 1, borderColor: '#E5E8EB',
          })}
        >
          <Pencil size={16} color="#4E5968" />
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#4E5968' }}>수정</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
            backgroundColor: pressed ? '#FFF1F0' : '#FFFFFF',
            borderRadius: 14, paddingVertical: 14,
            borderWidth: 1, borderColor: '#FFD8D8',
          })}
        >
          <Trash2 size={16} color="#FF4D4F" />
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#FF4D4F' }}>삭제</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
