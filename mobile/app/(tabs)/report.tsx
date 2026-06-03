import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventStore } from '@/stores/eventStore';
import { useCardStore } from '@/stores/cardStore';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors, Fonts } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
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

// 누적 요약 카드는 항상 어두운 디자인 (라이트/다크 공통) — Pencil EJlCt/ReportDark 일치
const SUMMARY_BG = '#191F28';
const SUMMARY_INK = '#FFFFFF';
const SUMMARY_INK_DIM_60 = 'rgba(255,255,255,0.6)';
const SUMMARY_INK_DIM_70 = 'rgba(255,255,255,0.7)';
const SUMMARY_DIVIDER = 'rgba(255,255,255,0.08)';

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

  // 라이트/다크 자동 해석 — RefreshControl tintColor, 자식 컴포넌트 prop 으로 전달
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];

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
    <SafeAreaScreen>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={C.primary} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 헤더 */}
        <View className="px-6 pt-4 pb-2">
          <Text
            className="text-[22px] text-ink dark:text-ink-dark"
            style={{ fontFamily: Fonts.bold }}
          >
            리포트
          </Text>
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
                className={`px-4 py-2 rounded-full ${
                  active ? 'bg-ink dark:bg-ink-dark' : 'bg-surface dark:bg-surface-dark'
                }`}
              >
                <Text
                  className={`text-label ${
                    active ? 'text-bg dark:text-bg-dark' : 'text-ink-2 dark:text-ink-2-dark'
                  }`}
                  style={{ fontFamily: Fonts.semibold }}
                >
                  {y === 'all' ? '전체' : `${y}년`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 누적 요약 카드 — 확정·예상 금액 분리 (이용금액 표시 금지 — 금융연동 없음).
            이 카드는 라이트/다크 공통으로 어두운 디자인 유지 (Pencil ReportDark 일치) */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 16,
            padding: 20,
            borderRadius: 20,
            backgroundColor: SUMMARY_BG,
            gap: 12,
          }}
        >
          <View>
            <Text style={{ color: SUMMARY_INK_DIM_60, fontSize: 13, fontFamily: Fonts.medium }}>
              누적 확정
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <Text style={{ color: SUMMARY_INK, fontSize: 26, fontFamily: Fonts.bold }}>
                {formatKRW(totals.confirmed)}
              </Text>
              <Text style={{ color: SUMMARY_INK_DIM_70, fontSize: 14, fontFamily: Fonts.medium }}>
                {counts.paid}건
              </Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: SUMMARY_DIVIDER }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: SUMMARY_INK_DIM_60, fontSize: 13, fontFamily: Fonts.medium }}>
              예상 {formatKRW(totals.expected)}
            </Text>
            <Text style={{ color: SUMMARY_INK_DIM_60, fontSize: 13, fontFamily: Fonts.medium }}>
              진행 {counts.inProgress}건 · 응모 {counts.applied}건
            </Text>
          </View>
        </View>

        {/* 빈 상태 */}
        {filtered.length === 0 && (
          <View className="items-center p-12 gap-2">
            <Text
              className="text-[15px] text-ink-3 dark:text-ink-3-dark"
              style={{ fontFamily: Fonts.medium }}
            >
              이벤트 데이터가 없습니다
            </Text>
            <Text
              className="text-[13px] text-ink-4 dark:text-ink-4-dark"
              style={{ fontFamily: Fonts.sans }}
            >
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
    </SafeAreaScreen>
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
    <View className="mb-2">
      {/* 연도 헤더 */}
      <View className="flex-row justify-between items-baseline px-6 py-3">
        <Text
          className="text-[16px] text-ink dark:text-ink-dark"
          style={{ fontFamily: Fonts.bold }}
        >
          {year === '미분류' ? '미분류' : `${year}년`}
        </Text>
        <Text
          className="text-label text-accent dark:text-accent-dark"
          style={{ fontFamily: Fonts.bold }}
        >
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
  const totals = useMemo(() => summarizeEvents(events, benefitsByEvent), [events, benefitsByEvent]);

  const monthLabel = month === '미분류' ? '날짜 없음' : `${Number(month.slice(5, 7))}월`;

  return (
    <View className="mx-4 mb-2 rounded-lg border border-border-strong dark:border-border-strong-dark overflow-hidden">
      {/* 월 헤더 */}
      <View className="flex-row justify-between p-[14px] bg-surface dark:bg-surface-dark">
        <Text
          className="text-label text-ink-2 dark:text-ink-2-dark"
          style={{ fontFamily: Fonts.bold }}
        >
          {monthLabel}
        </Text>
        <View className="flex-row gap-2 items-baseline">
          <Text
            className="text-label text-ink dark:text-ink-dark"
            style={{ fontFamily: Fonts.bold }}
          >
            {totals.confirmed.toLocaleString('ko-KR')}원
          </Text>
          <Text
            className="text-caption text-ink-3 dark:text-ink-3-dark"
            style={{ fontFamily: Fonts.medium }}
          >
            +예상 {totals.expected.toLocaleString('ko-KR')}원
          </Text>
        </View>
      </View>

      {/* 이벤트 행 — Pressable 함수형 style 제거 (RN 0.81 회귀 fix). pressed 효과는 추후 별도 패턴 적용 */}
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
            className="flex-row items-center justify-between p-[14px] border-t border-border dark:border-border-dark bg-bg dark:bg-bg-dark gap-3"
          >
            <View className="flex-1 gap-0.5">
              <Text
                className="text-label text-ink dark:text-ink-dark"
                style={{ fontFamily: Fonts.semibold }}
                numberOfLines={1}
              >
                {e.title}
              </Text>
              {card ? (
                <Text
                  className="text-caption text-ink-3 dark:text-ink-3-dark"
                  style={{ fontFamily: Fonts.sans }}
                >
                  {card.issuer}
                </Text>
              ) : null}
            </View>
            <View className="items-end gap-1">
              <Text
                className="text-[13px] text-ink dark:text-ink-dark"
                style={{ fontFamily: Fonts.bold }}
              >
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
