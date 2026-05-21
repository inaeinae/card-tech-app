import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useEventStore } from '@/stores/eventStore';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import {
  DOT_COLOR,
  extractMilestoneDates,
  groupEventsByDate,
  statusToDotCategory,
} from '@/lib/calendarDots';
import type { EventRow } from '@/types/models';

type Segment = 'month' | 'agenda';

export default function CalendarScreen() {
  const router = useRouter();
  const events = useEventStore((s) => s.events);
  const loadEvents = useEventStore((s) => s.loadEvents);
  const loading = useEventStore((s) => s.loading);

  // 라이트/다크 자동 해석 — Calendar theme prop, 인라인 색에 사용
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];

  const [segment, setSegment] = useState<Segment>('month');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // 마운트 시 이벤트 1회 로드 (홈 탭과 독립적으로 진입 가능)
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRefresh = useCallback(() => {
    loadEvents();
  }, [loadEvents]);

  // 일자별 그룹 — markedDates · agenda 양쪽에서 재사용
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);

  const markedDates = useMemo(() => {
    const marks: Record<
      string,
      { dots: { color: string; key: string }[]; selected?: boolean; selectedColor?: string }
    > = {};
    for (const [day, list] of Object.entries(eventsByDate)) {
      const dots: { color: string; key: string }[] = [];
      for (const e of list) {
        const cat = statusToDotCategory(e.status);
        if (!dots.find((x) => x.key === cat)) dots.push({ key: cat, color: DOT_COLOR[cat] });
      }
      marks[day] = { dots };
    }
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: C.primary };
    } else {
      marks[selectedDate] = { dots: [], selected: true, selectedColor: C.primary };
    }
    return marks;
  }, [eventsByDate, selectedDate, C.primary]);

  const dayEvents = useMemo(() => eventsByDate[selectedDate] ?? [], [eventsByDate, selectedDate]);

  return (
    <SafeAreaScreen>
      {/* 헤더 */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-[22px] font-bold text-ink dark:text-ink-dark">캘린더</Text>
      </View>

      {/* 세그먼트 토글 */}
      <View className="mx-6 mb-2 bg-surface dark:bg-surface-dark rounded-md flex-row p-1">
        {[['month', '월'] as [Segment, string], ['agenda', '일정'] as [Segment, string]].map(
          ([key, label]) => {
            const active = segment === key;
            return (
              <Pressable
                key={key}
                onPress={() => setSegment(key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={`flex-1 py-2 rounded-sm items-center ${
                  active ? 'bg-bg dark:bg-bg-dark' : ''
                }`}
              >
                <Text
                  className={`text-label ${
                    active
                      ? 'font-bold text-ink dark:text-ink-dark'
                      : 'font-medium text-ink-3 dark:text-ink-3-dark'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          },
        )}
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
      >
        {segment === 'month' && (
          <>
            <Calendar
              markingType="multi-dot"
              markedDates={markedDates}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              theme={{
                // 다크/라이트 자동 — Colors[scheme] 기반
                calendarBackground: C.bg,
                monthTextColor: C.ink,
                dayTextColor: C.ink,
                textDisabledColor: C.ink4,
                textSectionTitleColor: C.ink3,
                arrowColor: C.primary,
                todayTextColor: C.primary,
                selectedDayBackgroundColor: C.primary,
                selectedDayTextColor: '#FFFFFF',
                dotColor: C.primary,
                selectedDotColor: '#FFFFFF',
                textDayFontFamily: 'NotoSansKR_400Regular',
                textMonthFontFamily: 'NotoSansKR_700Bold',
                textDayHeaderFontFamily: 'NotoSansKR_500Medium',
                textDayStyle: { marginTop: 0, textAlignVertical: 'center' },
              }}
            />

            {/* 선택 날짜 인라인 섹션 */}
            <View className="p-4 gap-2">
              <Text className="text-[13px] font-semibold text-ink-3 dark:text-ink-3-dark">
                {selectedDate} 일정
              </Text>
              {dayEvents.length === 0 ? (
                <Text className="text-label text-ink-3 dark:text-ink-3-dark p-2">
                  이날 일정이 없습니다
                </Text>
              ) : (
                dayEvents.map((e) => (
                  <CalendarEventCard
                    key={e.id}
                    event={e}
                    onPress={() => router.push(`/events/${e.id}`)}
                  />
                ))
              )}
            </View>
          </>
        )}

        {segment === 'agenda' && (
          <AgendaList eventsByDate={eventsByDate} onSelect={(id) => router.push(`/events/${id}`)} />
        )}

        {/* dot 범례 */}
        <View className="flex-row flex-wrap gap-2 px-4 pb-8">
          {Object.entries(DOT_COLOR).map(([label, color]) => (
            <View key={label} className="flex-row items-center gap-1">
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
              <Text className="text-[11px] text-ink-3 dark:text-ink-3-dark">{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaScreen>
  );
}

function CalendarEventCard({ event, onPress }: { event: EventRow; onPress: () => void }) {
  const cat = statusToDotCategory(event.status);
  const barColor = DOT_COLOR[cat];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${event.title} 상세 보기`}
      className="p-[14px] rounded-2xl border border-border-strong dark:border-border-strong-dark bg-bg dark:bg-bg-dark flex-row items-center gap-3"
    >
      {/* 좌측 컬러 바 4×40 (UI_STRUCTURE §2.5) */}
      <View style={{ width: 4, height: 40, borderRadius: 999, backgroundColor: barColor }} />
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-ink dark:text-ink-dark" numberOfLines={1}>
          {event.title}
        </Text>
        <Text className="text-[13px] text-ink-3 dark:text-ink-3-dark" numberOfLines={1}>
          {extractMilestoneDates(event).join(' · ')}
        </Text>
      </View>
      <StatusBadge status={event.status} />
    </Pressable>
  );
}

function AgendaList({
  eventsByDate,
  onSelect,
}: {
  eventsByDate: Record<string, EventRow[]>;
  onSelect: (id: string) => void;
}) {
  // 오늘 이후 일자만 오름차순 — 과거 milestone 까지 노출하면 노이즈 증가
  const today = new Date().toISOString().slice(0, 10);
  const sortedDates = Object.keys(eventsByDate)
    .filter((d) => d >= today)
    .sort();

  if (sortedDates.length === 0) {
    return (
      <View className="p-6 items-center">
        <Text className="text-label text-ink-3 dark:text-ink-3-dark">예정된 일정이 없습니다</Text>
      </View>
    );
  }

  return (
    <View className="px-4 pt-2 gap-4">
      {sortedDates.map((d) => (
        <View key={d} className="gap-2">
          <Text className="text-[13px] font-semibold text-ink-3 dark:text-ink-3-dark">{d}</Text>
          {eventsByDate[d].map((e) => (
            <CalendarEventCard key={`${d}-${e.id}`} event={e} onPress={() => onSelect(e.id)} />
          ))}
        </View>
      ))}
    </View>
  );
}
