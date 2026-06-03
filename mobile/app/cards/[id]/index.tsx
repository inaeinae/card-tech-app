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
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

type Tab = 'benefits' | 'history';

// Hero 카드 단색 배경 — 발급사 브랜드 컬러 (라이트/다크 공통, 카드 표면 톤 유지)
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
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];

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

  const heroColor = ISSUER_COLOR[card.issuer] ?? C.primary;

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
      <View className="flex-row items-center justify-between px-2 h-14">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-surface dark:bg-surface-dark items-center justify-center"
        >
          <ChevronLeft size={20} color={C.ink} />
        </Pressable>
        <Pressable
          onPress={onMenuPress}
          className="w-10 h-10 rounded-full bg-surface dark:bg-surface-dark items-center justify-center"
        >
          <EllipsisVertical size={20} color={C.ink} />
        </Pressable>
      </View>

      {/* Hero 카드 — 발급사 브랜드 컬러 단색 (라이트/다크 공통) */}
      <View
        style={{
          marginHorizontal: 24,
          borderRadius: 24,
          padding: 24,
          backgroundColor: heroColor,
          height: 200,
        }}
      >
        <View className="flex-row justify-between items-start">
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
      <View className="mx-6 mt-4 bg-surface-2 dark:bg-surface-2-dark rounded-md flex-row p-1">
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
            className={`flex-1 py-2 rounded-sm items-center ${
              tab === key ? 'bg-bg dark:bg-bg-dark' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-label ${
                tab === key
                  ? 'font-bold text-ink dark:text-ink-dark'
                  : 'font-medium text-ink-3 dark:text-ink-3-dark'
              }`}
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
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: C.borderStrong,
                backgroundColor: C.bg,
              }}
            >
              <Text
                className="text-ink dark:text-ink-dark flex-1"
                style={{ fontSize: 15, fontWeight: '600' }}
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
        className="absolute bottom-0 left-0 right-0 bg-bg dark:bg-bg-dark border-t border-border-strong dark:border-border-strong-dark"
        style={{
          padding: 24,
          paddingBottom: 36,
          gap: 12,
        }}
      >
        {cancelState === 'active' ? (
          <>
            <Pressable
              onPress={startWizard}
              style={{
                backgroundColor: C.primary,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>이벤트 등록</Text>
            </Pressable>
            <Pressable onPress={onMenuPress} style={{ alignItems: 'center' }}>
              <Text
                className="text-ink-3 dark:text-ink-3-dark"
                style={{ fontSize: 13, fontWeight: '500' }}
              >
                카드 해지하기
              </Text>
            </Pressable>
          </>
        ) : cancelState === 'scheduled' ? (
          <>
            <Pressable
              onPress={onMenuPress}
              className="bg-danger-soft dark:bg-danger-darkSoft"
              style={{
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text
                className="text-danger dark:text-danger-dark"
                style={{ fontSize: 16, fontWeight: '700' }}
              >
                해지 완료 기록
              </Text>
            </Pressable>
            <Pressable onPress={() => restoreCancel(card.id)} style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <RotateCcw size={14} color={C.ink3} />
                <Text
                  className="text-ink-3 dark:text-ink-3-dark"
                  style={{ fontSize: 13, fontWeight: '500' }}
                >
                  해지 예약 취소
                </Text>
              </View>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() => restoreCancel(card.id)}
            className="bg-surface dark:bg-surface-dark"
            style={{
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <RotateCcw size={16} color={C.ink2} />
            <Text
              className="text-ink-2 dark:text-ink-2-dark"
              style={{ fontSize: 16, fontWeight: '700' }}
            >
              해지 되돌리기
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaScreen>
  );
}
