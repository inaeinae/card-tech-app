import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import EventListItem from '@/components/home/EventListItem';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { sumEventExpected } from '@/lib/eventTotals';
import { useCardStore } from '@/stores/cardStore';
import { useEventStore } from '@/stores/eventStore';
import type { EventRow, EventStatus } from '@/types/models';

type FilterChip = 'all' | 'active' | 'done' | 'canceled';

const CHIPS: { key: FilterChip; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행중' },
  { key: 'done', label: '완료' },
  { key: 'canceled', label: '해지' },
];

const ACTIVE_SET = new Set<EventStatus>([
  'registered',
  'applied',
  'in_progress',
  'performance_done',
  'pending_payout',
  'cancelable',
]);

function filterEvents(events: EventRow[], chip: FilterChip): EventRow[] {
  if (chip === 'all') return events;
  if (chip === 'active') return events.filter((e) => ACTIVE_SET.has(e.status));
  if (chip === 'done') return events.filter((e) => e.status === 'paid');
  if (chip === 'canceled') return events.filter((e) => e.status === 'canceled');
  return events;
}

export default function EventListScreen() {
  const router = useRouter();
  const events = useEventStore((s) => s.events);
  const loading = useEventStore((s) => s.loading);
  const loadEvents = useEventStore((s) => s.loadEvents);
  const benefitsByEvent = useEventStore((s) => s.benefitsByEvent);
  const loadEventBenefits = useEventStore((s) => s.loadEventBenefits);
  const cards = useCardStore((s) => s.cards);
  const [chip, setChip] = useState<FilterChip>('all');

  useEffect(() => {
    (async () => {
      await loadEvents();
      await loadEventBenefits();
    })();
  }, [loadEvents, loadEventBenefits]);

  const filtered = useMemo(() => filterEvents(events, chip), [events, chip]);

  const handleRefresh = useCallback(async () => {
    await loadEvents();
    await loadEventBenefits();
  }, [loadEvents, loadEventBenefits]);

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
    [cards, benefitsByEvent, router],
  );

  return (
    <SafeAreaScreen>
      {/* 헤더 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 4,
          gap: 8,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={24} color="#191F28" />
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#191F28' }}>이벤트</Text>
      </View>

      {/* 필터 칩 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
      >
        {CHIPS.map((c) => (
          <Pressable
            key={c.key}
            onPress={() => setChip(c.key)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: chip === c.key ? '#191F28' : '#F9FAFB',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: chip === c.key ? '#FFFFFF' : '#4E5968',
              }}
            >
              {c.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* 목록 */}
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor="#3182F6" />
        }
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 48 }}>
            <Text style={{ fontSize: 15, color: '#8B95A1' }}>이벤트가 없습니다</Text>
          </View>
        }
      />
    </SafeAreaScreen>
  );
}
