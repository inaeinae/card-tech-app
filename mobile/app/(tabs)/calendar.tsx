import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useEventStore } from '@/stores/eventStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import {
  DOT_COLOR,
  extractMilestoneDates,
  groupEventsByDate,
  statusToDotCategory,
} from '@/lib/calendarDots';
import type { EventRow } from '@/types/models';

type Segment = 'month' | 'agenda';

const C = Colors.light;

export default function CalendarScreen() {
  const router = useRouter();
  const events = useEventStore((s) => s.events);
  const loadEvents = useEventStore((s) => s.loadEvents);
  const loading = useEventStore((s) => s.loading);

  const [segment, setSegment] = useState<Segment>('month');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

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
  }, [eventsByDate, selectedDate]);

  const dayEvents = useMemo(() => eventsByDate[selectedDate] ?? [], [eventsByDate, selectedDate]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* 헤더 */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: C.ink }}>캘린더</Text>
      </View>

      {/* 세그먼트 토글 */}
      <View
        style={{
          marginHorizontal: 24,
          marginBottom: 8,
          backgroundColor: C.surface2,
          borderRadius: 12,
          flexDirection: 'row',
          padding: 4,
        }}
      >
        {(
          [
            ['month', '월'] as [Segment, string],
            ['agenda', '일정'] as [Segment, string],
          ]
        ).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setSegment(key)}
            accessibilityRole="button"
            accessibilityState={{ selected: segment === key }}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: segment === key ? C.bg : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: segment === key ? '700' : '500',
                color: segment === key ? C.ink : C.ink3,
              }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
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
                todayTextColor: C.primary,
                selectedDayBackgroundColor: C.primary,
                selectedDayTextColor: C.bg,
                arrowColor: C.primary,
                textDayFontFamily: 'NotoSansKR_400Regular',
                textMonthFontFamily: 'NotoSansKR_700Bold',
                textDayHeaderFontFamily: 'NotoSansKR_500Medium',
                textDayStyle: { marginTop: 0, textAlignVertical: 'center' },
              }}
            />

            {/* 선택 날짜 인라인 섹션 */}
            <View style={{ padding: 16, gap: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.ink3 }}>
                {selectedDate} 일정
              </Text>
              {dayEvents.length === 0 ? (
                <Text style={{ fontSize: 14, color: C.ink3, padding: 8 }}>
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
          <AgendaList
            eventsByDate={eventsByDate}
            onSelect={(id) => router.push(`/events/${id}`)}
          />
        )}

        {/* dot 범례 */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            paddingHorizontal: 16,
            paddingBottom: 32,
          }}
        >
          {Object.entries(DOT_COLOR).map(([label, color]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
              <Text style={{ fontSize: 11, color: C.ink3 }}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CalendarEventCard({
  event,
  onPress,
}: {
  event: EventRow;
  onPress: () => void;
}) {
  const cat = statusToDotCategory(event.status);
  const barColor = DOT_COLOR[cat];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${event.title} 상세 보기`}
      style={({ pressed }) => ({
        padding: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.borderStrong,
        backgroundColor: pressed ? C.surface : C.bg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      })}
    >
      {/* 좌측 컬러 바 4×40 (UI_STRUCTURE §2.5) */}
      <View style={{ width: 4, height: 40, borderRadius: 999, backgroundColor: barColor }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.ink }} numberOfLines={1}>
          {event.title}
        </Text>
        <Text style={{ fontSize: 13, color: C.ink3 }} numberOfLines={1}>
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
      <View style={{ padding: 24, alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: C.ink3 }}>예정된 일정이 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, gap: 16 }}>
      {sortedDates.map((d) => (
        <View key={d} style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.ink3 }}>{d}</Text>
          {eventsByDate[d].map((e) => (
            <CalendarEventCard key={`${d}-${e.id}`} event={e} onPress={() => onSelect(e.id)} />
          ))}
        </View>
      ))}
    </View>
  );
}
