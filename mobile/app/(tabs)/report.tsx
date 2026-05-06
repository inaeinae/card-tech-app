import { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useEventStore } from '@/stores/eventStore';
import { useCardStore } from '@/stores/cardStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRouter } from 'expo-router';
import type { EventRow } from '@/types/models';

type PeriodChip = 'all' | string;

function groupByYear(events: EventRow[]): Record<string, EventRow[]> {
  return events.reduce<Record<string, EventRow[]>>((acc, e) => {
    const year = (e.use_start ?? e.created_at ?? '').slice(0, 4) || '미분류';
    (acc[year] ??= []).push(e);
    return acc;
  }, {});
}

function groupByMonth(events: EventRow[]): Record<string, EventRow[]> {
  return events.reduce<Record<string, EventRow[]>>((acc, e) => {
    const month = (e.use_start ?? e.created_at ?? '').slice(0, 7) || '미분류';
    (acc[month] ??= []).push(e);
    return acc;
  }, {});
}

export default function ReportScreen() {
  const router = useRouter();
  const events = useEventStore((s) => s.events);
  const loading = useEventStore((s) => s.loading);
  const loadEvents = useEventStore((s) => s.loadEvents);
  const cards = useCardStore((s) => s.cards);
  const [period, setPeriod] = useState<PeriodChip>('all');

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const years = useMemo(() =>
    [...new Set(events.map((e) => (e.use_start ?? e.created_at ?? '').slice(0, 4)))].sort().reverse(),
    [events],
  );

  const filtered = useMemo(() =>
    period === 'all' ? events : events.filter((e) => (e.use_start ?? e.created_at ?? '').startsWith(period)),
    [events, period],
  );

  const paidCount = useMemo(() => filtered.filter((e) => e.status === 'paid').length, [filtered]);

  const yearGroups = useMemo(() => groupByYear(filtered), [filtered]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadEvents} tintColor="#3182F6" />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 헤더 */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#191F28' }}>리포트</Text>
        </View>

        {/* 기간 필터 칩 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 8 }}>
          {(['all', ...years] as string[]).map((y) => (
            <Pressable
              key={y}
              onPress={() => setPeriod(y)}
              style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: period === y ? '#191F28' : '#F9FAFB' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: period === y ? '#FFFFFF' : '#4E5968' }}>
                {y === 'all' ? '전체' : `${y}년`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 누적 요약 카드 — 이용금액(spend_actual) 표시 금지 */}
        <View style={{ marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 20, backgroundColor: '#191F28' }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>누적 확정 이벤트</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 4 }}>
            {paidCount}건
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 8 }}>
            진행 중 {filtered.filter((e) => e.status === 'in_progress').length}건 · 응모 {filtered.filter((e) => e.status === 'applied').length}건
          </Text>
        </View>

        {/* 연/월/이벤트 계층 */}
        {Object.entries(yearGroups).sort(([a], [b]) => b.localeCompare(a)).map(([year, yearEvents]) => {
          const monthGroups = groupByMonth(yearEvents);
          const yearPaidCount = yearEvents.filter((e) => e.status === 'paid').length;
          return (
            <View key={year} style={{ marginBottom: 8 }}>
              {/* 연도 헤더 */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#191F28' }}>{year}년</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#19D294' }}>확정 {yearPaidCount}건</Text>
              </View>

              {/* 월 카드 */}
              {Object.entries(monthGroups).sort(([a], [b]) => b.localeCompare(a)).map(([month, monthEvents]) => (
                <View key={month} style={{ marginHorizontal: 16, marginBottom: 8, borderRadius: 16, borderWidth: 1, borderColor: '#E5E8EB', overflow: 'hidden' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14, backgroundColor: '#F9FAFB' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#4E5968' }}>{month.slice(5)}월</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#191F28' }}>{monthEvents.length}건</Text>
                  </View>
                  {monthEvents.map((e) => {
                    const card = cards.find((c) => c.id === e.card_id);
                    return (
                      <Pressable
                        key={e.id}
                        onPress={() => router.push(`/events/${e.id}`)}
                        style={({ pressed }) => ({
                          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                          padding: 14, borderTopWidth: 1, borderTopColor: '#F2F4F6',
                          backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
                        })}
                      >
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#191F28' }} numberOfLines={1}>{e.title}</Text>
                          {card ? <Text style={{ fontSize: 12, color: '#8B95A1' }}>{card.issuer}</Text> : null}
                        </View>
                        <StatusBadge status={e.status} />
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', padding: 48 }}>
            <Text style={{ fontSize: 15, color: '#8B95A1' }}>이벤트 데이터가 없습니다</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
