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
              tintColor="#3182F6"
            />
          }
          ListHeaderComponent={
            <SummaryCard confirmedAmount={confirmedAmount} expectedAmount={expectedAmount} />
          }
          ListFooterComponent={
            <Pressable
              onPress={() => router.push('/events')}
              style={{ alignItems: 'center', padding: 16 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#3182F6' }}>
                전체 이벤트 보기 →
              </Text>
            </Pressable>
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        />
      )}

      {/* FAB */}
      {activeEvents.length > 0 && (
        <Pressable
          onPress={startWizard}
          style={({ pressed }) => ({
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: pressed ? '#1B64DA' : '#3182F6',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#3182F6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 6,
          })}
          accessibilityLabel="이벤트 등록"
        >
          <Plus size={28} color="#FFFFFF" />
        </Pressable>
      )}
    </SafeAreaScreen>
  );
}
