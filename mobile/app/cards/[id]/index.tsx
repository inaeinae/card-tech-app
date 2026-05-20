// 카드 상세 — Hero 카드 + 탭 세그먼트(상시혜택/이벤트이력) + sticky CTA
// Pencil frame bH9xP 기반 재설계
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, CreditCard, EllipsisVertical, RotateCcw } from 'lucide-react-native';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { CardBenefitItem } from '@/components/cards/CardBenefitItem';
import { useCardStore } from '@/stores/cardStore';
import { useEventStore } from '@/stores/eventStore';
import { useWizardStore } from '@/stores/wizardStore';
import { computeCancelState } from '@/lib/cardCancel';
import { CARD_TYPE_LABEL } from '@/types/models';
import { formatWon } from '@/lib/formatWon';

type Tab = 'benefits' | 'history';

const ISSUER_COLOR: Record<string, string> = {
  BC카드: '#E30547',
  하나카드: '#009B6E',
  신한카드: '#1A4DB4',
  국민카드: '#CD950C',
  현대카드: '#111111',
  삼성카드: '#034EA2',
  롯데카드: '#E61E2B',
  우리카드: '#0070C0',
  씨티카드: '#003B8E',
};

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const card = useCardStore((s) => s.cards.find((c) => c.id === id));
  const benefits = useCardStore((s) => (id ? (s.benefits[id] ?? []) : []));
  const loadCardBenefits = useCardStore((s) => s.loadCardBenefits);
  const scheduleCancel = useCardStore((s) => s.scheduleCancel);
  const confirmCancel = useCardStore((s) => s.confirmCancel);
  const restoreCancel = useCardStore((s) => s.restoreCancel);

  const events = useEventStore((s) => s.events.filter((e) => e.card_id === id));
  const loadEvents = useEventStore((s) => s.loadEvents);

  const [tab, setTab] = useState<Tab>('benefits');

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
    if (id) {
      loadCardBenefits(id);
      loadEvents({ cardId: id });
    }
  }, [id, loadCardBenefits, loadEvents]);

  if (!card) return <LoadingState />;

  const heroColor = ISSUER_COLOR[card.issuer] ?? '#3182F6';

  function onMenuPress() {
    if (!card) return;
    const cardId = card.id;
    Alert.alert('카드 관리', undefined, [
      { text: '수정', onPress: () => router.push(`/cards/${id}/edit`) },
      cancelState === 'active'
        ? {
            text: '해지 예약',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                '해지 예약',
                '이 카드의 해지를 예약하시겠습니까? 실제 해지 전까지는 취소 가능합니다.',
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
                        Alert.alert('오류', e instanceof Error ? e.message : '알 수 없는 오류');
                      }
                    },
                  },
                ],
              );
            },
          }
        : cancelState === 'scheduled'
          ? {
              text: '해지 완료 기록',
              style: 'destructive',
              onPress: async () => {
                const today = new Date().toISOString().slice(0, 10);
                try {
                  await confirmCancel(cardId, today);
                } catch (e) {
                  Alert.alert('오류', e instanceof Error ? e.message : '알 수 없는 오류');
                }
              },
            }
          : { text: '해지 되돌리기', onPress: () => restoreCancel(cardId) },
      { text: '취소', style: 'cancel' },
    ]);
  }

  function startWizard() {
    useWizardStore.getState().reset();
    router.push('/wizard/step-card');
  }

  return (
    <SafeAreaScreen>
      {/* 상단 앱바 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: 56,
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F9FAFB',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color="#191F28" />
        </Pressable>
        <Pressable
          onPress={onMenuPress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F9FAFB',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EllipsisVertical size={20} color="#191F28" />
        </Pressable>
      </View>

      {/* Hero 카드 */}
      <View
        style={{
          marginHorizontal: 24,
          borderRadius: 24,
          padding: 24,
          backgroundColor: heroColor,
          height: 200,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ gap: 4 }}>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 3,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600' }}>
                {card.issuer}
              </Text>
            </View>
            <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '700', marginTop: 2 }}>
              {card.name}
            </Text>
          </View>
          <CreditCard size={28} color="rgba(255,255,255,0.5)" />
        </View>

        {/* 해지 상태 배너 */}
        {cancelState !== 'active' && (
          <View
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor:
                cancelState === 'canceled' ? 'rgba(255,77,79,0.85)' : 'rgba(245,158,11,0.85)',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
              {cancelState === 'scheduled'
                ? `해지 예약 · ${card.cancel_scheduled_at}`
                : `해지됨 · ${card.canceled_at}`}
            </Text>
          </View>
        )}

        <View
          style={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            right: 24,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500' }}>
              이벤트
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
              {events.length}건
            </Text>
          </View>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600' }}>
              혜택 {benefits.length}개
            </Text>
          </View>
        </View>
      </View>

      {/* 카드 메타 — 카드 종류 / 연회비 / 전월실적 */}
      {card.card_type ? (
        <View className="flex-row items-center gap-2 flex-wrap mx-6 mt-3">
          <Chip label={CARD_TYPE_LABEL[card.card_type]} size="sm" />
          {card.annual_fee_won !== null ? (
            <Text className="text-label text-muted dark:text-muted-dark">
              연회비 {formatWon(card.annual_fee_won)}원
            </Text>
          ) : null}
          {card.base_min_spend_won !== null ? (
            <Text className="text-label text-muted dark:text-muted-dark">
              · 전월실적 {formatWon(card.base_min_spend_won)}원
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* 탭 세그먼트 */}
      <View
        style={{
          marginHorizontal: 24,
          marginTop: 16,
          backgroundColor: '#F2F4F6',
          borderRadius: 12,
          flexDirection: 'row',
          padding: 4,
        }}
      >
        {(
          [
            ['benefits', '상시 혜택'],
            ['history', '이벤트 이력'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: tab === key ? '#FFFFFF' : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: tab === key ? '700' : '500',
                color: tab === key ? '#191F28' : '#8B95A1',
              }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 탭 콘텐츠 */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 140, gap: 8 }}
      >
        {tab === 'benefits' ? (
          benefits.length === 0 ? (
            <EmptyState title="등록된 상시 혜택이 없습니다" />
          ) : (
            benefits.map((b) => <CardBenefitItem key={b.id} benefit={b} />)
          )
        ) : events.length === 0 ? (
          <EmptyState title="이 카드로 등록된 이벤트가 없습니다" />
        ) : (
          events.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => router.push(`/events/${e.id}`)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: '#E5E8EB',
                backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
              })}
            >
              <Text
                style={{ fontSize: 15, fontWeight: '600', color: '#191F28', flex: 1 }}
                numberOfLines={1}
              >
                {e.title}
              </Text>
              <StatusBadge status={e.status} />
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* sticky CTA */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E8EB',
          padding: 24,
          paddingBottom: 36,
          gap: 12,
        }}
      >
        {cancelState === 'active' ? (
          <>
            <Pressable
              onPress={startWizard}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#1B64DA' : '#3182F6',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>이벤트 등록</Text>
            </Pressable>
            <Pressable onPress={onMenuPress} style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#8B95A1' }}>
                카드 해지하기
              </Text>
            </Pressable>
          </>
        ) : cancelState === 'scheduled' ? (
          <>
            <Pressable
              onPress={onMenuPress}
              style={{
                backgroundColor: '#FFF1F0',
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FF4D4F', fontSize: 16, fontWeight: '700' }}>
                해지 완료 기록
              </Text>
            </Pressable>
            <Pressable onPress={() => restoreCancel(card.id)} style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <RotateCcw size={14} color="#8B95A1" />
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#8B95A1' }}>
                  해지 예약 취소
                </Text>
              </View>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() => restoreCancel(card.id)}
            style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <RotateCcw size={16} color="#4E5968" />
            <Text style={{ color: '#4E5968', fontSize: 16, fontWeight: '700' }}>해지 되돌리기</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaScreen>
  );
}
