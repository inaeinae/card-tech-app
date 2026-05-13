import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventStore } from '@/stores/eventStore';
import { useCardStore } from '@/stores/cardStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors, Fonts } from '@/constants/theme';
import { summarizeEvents } from '@/lib/eventTotals';
import {
  countByStatus,
  extractYears,
  filterByYear,
  groupEventsByMonth,
  groupEventsByYear,
  type PeriodFilter,
} from '@/lib/reportAggregate';
import type { EventRow } from '@/types/models';

const C = Colors.light;

// 천 단위 구분자 포맷 — 금융 화면 공통 표기
function formatKRW(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export default function ReportScreen() {
  const router = useRouter();
  const events = useEventStore((s) => s.events);
  const benefitsByEvent = useEventStore((s) => s.benefitsByEvent);
  const loading = useEventStore((s) => s.loading);
  const loadEvents = useEventStore((s) => s.loadEvents);
  const loadEventBenefits = useEventStore((s) => s.loadEventBenefits);
  const cards = useCardStore((s) => s.cards);
  const loadCards = useCardStore((s) => s.loadCards);

  const [period, setPeriod] = useState<PeriodFilter>('all');

  // 마운트 시 events → benefits 순서로 로드 (benefits 는 events.id 가 필요)
  useEffect(() => {
    (async () => {
      await loadEvents();
      await loadEventBenefits();
    })();
    loadCards();
  }, [loadEvents, loadEventBenefits, loadCards]);

  const handleRefresh = useCallback(async () => {
    await loadEvents();
    await loadEventBenefits();
  }, [loadEvents, loadEventBenefits]);

  const years = useMemo(() => extractYears(events), [events]);
  const filtered = useMemo(() => filterByYear(events, period), [events, period]);

  // 금액 집계 (확정/예상 분리)
  const totals = useMemo(
    () => summarizeEvents(filtered, benefitsByEvent),
    [filtered, benefitsByEvent],
  );
  // 카운트 (paid / 진행중 / applied)
  const counts = useMemo(() => countByStatus(filtered), [filtered]);

  const yearGroups = useMemo(() => groupEventsByYear(filtered), [filtered]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={C.primary} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 헤더 */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 22, fontFamily: Fonts.bold, color: C.ink }}>리포트</Text>
        </View>

        {/* 기간 필터 칩 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 8 }}
        >
          {(['all', ...years] as PeriodFilter[]).map((y) => {
            const active = period === y;
            return (
              <Pressable
                key={y}
                onPress={() => setPeriod(y)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: active ? C.ink : C.surface,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.semibold,
                    color: active ? C.bg : C.ink2,
                  }}
                >
                  {y === 'all' ? '전체' : `${y}년`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 누적 요약 카드 — 확정·예상 금액 분리 (이용금액 표시 금지 — 금융연동 없음) */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 16,
            padding: 20,
            borderRadius: 20,
            backgroundColor: C.ink,
            gap: 12,
          }}
        >
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: Fonts.medium }}>
              누적 확정
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <Text style={{ color: C.bg, fontSize: 26, fontFamily: Fonts.bold }}>
                {formatKRW(totals.confirmed)}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: Fonts.medium }}>
                {counts.paid}건
              </Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: Fonts.medium }}>
              예상 {formatKRW(totals.expected)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: Fonts.medium }}>
              진행 {counts.inProgress}건 · 응모 {counts.applied}건
            </Text>
          </View>
        </View>

        {/* 빈 상태 */}
        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', padding: 48, gap: 8 }}>
            <Text style={{ fontSize: 15, fontFamily: Fonts.medium, color: C.ink3 }}>
              이벤트 데이터가 없습니다
            </Text>
            <Text style={{ fontSize: 13, fontFamily: Fonts.sans, color: C.ink4 }}>
              새 이벤트를 등록하면 여기에 집계됩니다
            </Text>
          </View>
        )}

        {/* 연/월/이벤트 계층 */}
        {Object.entries(yearGroups)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([year, yearEvents]) => (
            <YearSection
              key={year}
              year={year}
              events={yearEvents}
              benefitsByEvent={benefitsByEvent}
              cards={cards}
              onSelect={(id) => router.push(`/events/${id}`)}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function YearSection({
  year,
  events,
  benefitsByEvent,
  cards,
  onSelect,
}: {
  year: string;
  events: EventRow[];
  benefitsByEvent: Record<string, import('@/types/models').Benefit[]>;
  cards: import('@/types/models').Card[];
  onSelect: (id: string) => void;
}) {
  const monthGroups = useMemo(() => groupEventsByMonth(events), [events]);
  const yearTotals = useMemo(
    () => summarizeEvents(events, benefitsByEvent),
    [events, benefitsByEvent],
  );

  return (
    <View style={{ marginBottom: 8 }}>
      {/* 연도 헤더 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingHorizontal: 24,
          paddingVertical: 12,
        }}
      >
        <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: C.ink }}>
          {year === '미분류' ? '미분류' : `${year}년`}
        </Text>
        <Text style={{ fontSize: 14, fontFamily: Fonts.bold, color: C.accent }}>
          확정 {yearTotals.confirmed.toLocaleString('ko-KR')}원
        </Text>
      </View>

      {/* 월 카드 */}
      {Object.entries(monthGroups)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, monthEvents]) => (
          <MonthCard
            key={month}
            month={month}
            events={monthEvents}
            benefitsByEvent={benefitsByEvent}
            cards={cards}
            onSelect={onSelect}
          />
        ))}
    </View>
  );
}

function MonthCard({
  month,
  events,
  benefitsByEvent,
  cards,
  onSelect,
}: {
  month: string;
  events: EventRow[];
  benefitsByEvent: Record<string, import('@/types/models').Benefit[]>;
  cards: import('@/types/models').Card[];
  onSelect: (id: string) => void;
}) {
  const totals = useMemo(
    () => summarizeEvents(events, benefitsByEvent),
    [events, benefitsByEvent],
  );

  const monthLabel =
    month === '미분류'
      ? '날짜 없음'
      : `${Number(month.slice(5, 7))}월`;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.borderStrong,
        overflow: 'hidden',
      }}
    >
      {/* 월 헤더 */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 14,
          backgroundColor: C.surface,
        }}
      >
        <Text style={{ fontSize: 14, fontFamily: Fonts.bold, color: C.ink2 }}>{monthLabel}</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
          <Text style={{ fontSize: 14, fontFamily: Fonts.bold, color: C.ink }}>
            {totals.confirmed.toLocaleString('ko-KR')}원
          </Text>
          <Text style={{ fontSize: 12, fontFamily: Fonts.medium, color: C.ink3 }}>
            +예상 {totals.expected.toLocaleString('ko-KR')}원
          </Text>
        </View>
      </View>

      {/* 이벤트 행 */}
      {events.map((e) => {
        const card = cards.find((c) => c.id === e.card_id);
        const benefitSum = (benefitsByEvent[e.id] ?? []).reduce(
          (acc, b) => acc + Number(b.expected_amount ?? 0),
          0,
        );
        return (
          <Pressable
            key={e.id}
            onPress={() => onSelect(e.id)}
            accessibilityRole="button"
            accessibilityLabel={`${e.title} 상세 보기`}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 14,
              borderTopWidth: 1,
              borderTopColor: C.border,
              backgroundColor: pressed ? C.surface : C.bg,
              gap: 12,
            })}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{ fontSize: 14, fontFamily: Fonts.semibold, color: C.ink }}
                numberOfLines={1}
              >
                {e.title}
              </Text>
              {card ? (
                <Text style={{ fontSize: 12, fontFamily: Fonts.sans, color: C.ink3 }}>
                  {card.issuer}
                </Text>
              ) : null}
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={{ fontSize: 13, fontFamily: Fonts.bold, color: C.ink }}>
                {benefitSum.toLocaleString('ko-KR')}원
              </Text>
              <StatusBadge status={e.status} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
