import { useCallback, useEffect, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import SummaryCard from '@/components/home/SummaryCard';
import EventListItem from '@/components/home/EventListItem';
import EmptyHome from '@/components/home/EmptyHome';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { useEventStore } from '@/stores/eventStore';
import { useCardStore } from '@/stores/cardStore';
import { useWizardStore } from '@/stores/wizardStore';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import { Colors } from '@/constants/theme';
import type { EventRow } from '@/types/models';
import { sumEventExpected, summarizeEvents } from '@/lib/eventTotals';

// paid / canceled 제외 — active 이벤트만
const ACTIVE_STATUSES = new Set([
  'registered',
  'applied',
  'in_progress',
  'performance_done',
  'pending_payout',
  'cancelable',
]);

export default function HomeScreen() {
  const router = useRouter();
  const events = useEventStore((s) => s.events);
  const loading = useEventStore((s) => s.loading);
  const loadEvents = useEventStore((s) => s.loadEvents);
  const benefitsByEvent = useEventStore((s) => s.benefitsByEvent);
  const loadEventBenefits = useEventStore((s) => s.loadEventBenefits);
  const cards = useCardStore((s) => s.cards);

  // 다크/라이트 자동 해석 — lucide 아이콘 color / RefreshControl tintColor 인라인 토큰
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];

  useEffect(() => {
    (async () => {
      await loadEvents();
      await loadEventBenefits();
    })();
  }, [loadEvents, loadEventBenefits]);

  const activeEvents = events.filter((e) => ACTIVE_STATUSES.has(e.status));

  const summary = useMemo(
    () => summarizeEvents(events, benefitsByEvent),
    [events, benefitsByEvent],
  );
  const confirmedAmount = summary.confirmed;
  const expectedAmount = summary.expected;

  function startWizard() {
    useWizardStore.getState().reset();
    router.push('/wizard/step-card');
  }

  const renderItem = useCallback(
    ({ item }: { item: EventRow }) => {
      const card = cards.find((c) => c.id === item.card_id);
      return (
        <EventListItem
          id={item.id}
          title={item.title}
          issuer={card?.issuer ?? ''}
          status={item.status}
          expectedAmount={sumEventExpected(benefitsByEvent[item.id] ?? [])}
          onPress={() => router.push(`/events/${item.id}`)}
        />
      );
    },
    [cards, router, benefitsByEvent],
  );

  return (
    <SafeAreaScreen>
      {activeEvents.length === 0 && !loading ? (
        <EmptyHome onRegister={startWizard} />
      ) : (
        <FlatList
          data={activeEvents}
          keyExtractor={(e) => e.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={async () => {
                await loadEvents();
                await loadEventBenefits();
              }}
              tintColor={C.primary}
            />
          }
          ListHeaderComponent={
            <SummaryCard confirmedAmount={confirmedAmount} expectedAmount={expectedAmount} />
          }
          ListFooterComponent={
            <Pressable
              onPress={() => router.push('/events')}
              className="items-center p-4 active:opacity-80"
            >
              <Text className="text-label font-semibold text-primary">전체 이벤트 보기 →</Text>
            </Pressable>
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        />
      )}

      {/* FAB — pressed 피드백은 NativeWind active: variant (함수형 style 회귀 회피) */}
      {activeEvents.length > 0 && (
        <Pressable
          onPress={startWizard}
          className="active:opacity-80"
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: C.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: C.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 6,
          }}
          accessibilityLabel="이벤트 등록"
        >
          <Plus size={28} color="#FFFFFF" />
        </Pressable>
      )}
    </SafeAreaScreen>
  );
}
