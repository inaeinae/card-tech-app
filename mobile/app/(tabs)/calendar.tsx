import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useEventStore } from '@/stores/eventStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { EventStatus } from '@/types/models';

type Segment = 'month' | 'agenda';

// Phase 9 dot 색상 규칙
const DOT_COLORS: Record<string, string> = {
  응모: '#3182F6',
  이용: '#F59E0B',
  지급: '#19D294',
  해지: '#8B95A1',
  경고: '#FF4D4F',
};

function statusToDotCategory(status: EventStatus): string {
  if (['registered', 'applied'].includes(status)) return '응모';
  if (status === 'in_progress') return '이용';
  if (['performance_done', 'pending_payout', 'paid'].includes(status)) return '지급';
  if (status === 'canceled') return '해지';
  return '경고';
}

export default function CalendarScreen() {
  const router = useRouter();
  const events = useEventStore((s) => s.events);
  const [segment, setSegment] = useState<Segment>('month');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

  // 날짜별 dot 마킹 생성
  const markedDates = useMemo(() => {
    const marks: Record<string, { dots: { color: string; key: string }[]; selected?: boolean; selectedColor?: string }> = {};
    for (const ev of events) {
      const dates = [ev.apply_start, ev.use_start, ev.payout_expected_at].filter(Boolean) as string[];
      for (const d of dates) {
        const day = d.slice(0, 10);
        if (!marks[day]) marks[day] = { dots: [] };
        const cat = statusToDotCategory(ev.status);
        if (!marks[day].dots.find((x) => x.key === cat)) {
          marks[day].dots.push({ key: cat, color: DOT_COLORS[cat] });
        }
      }
    }
    // 선택 날짜 강조
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#3182F6' };
    } else {
      marks[selectedDate] = { dots: [], selected: true, selectedColor: '#3182F6' };
    }
    return marks;
  }, [events, selectedDate]);

  const dayEvents = useMemo(
    () =>
      events.filter((e) =>
        [e.apply_start, e.use_start, e.payout_expected_at]
          .filter(Boolean)
          .some((d) => d!.slice(0, 10) === selectedDate),
      ),
    [events, selectedDate],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* 헤더 */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#191F28' }}>캘린더</Text>
      </View>

      {/* 세그먼트 토글 */}
      <View style={{ marginHorizontal: 24, marginBottom: 8, backgroundColor: '#F2F4F6', borderRadius: 12, flexDirection: 'row', padding: 4 }}>
        {([['month', '월'] as [Segment, string], ['agenda', '일정'] as [Segment, string]]).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setSegment(key)}
            style={{
              flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
              backgroundColor: segment === key ? '#FFFFFF' : 'transparent',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: segment === key ? '700' : '500', color: segment === key ? '#191F28' : '#8B95A1' }}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView>
        {segment === 'month' && (
          <Calendar
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              todayTextColor: '#3182F6',
              selectedDayBackgroundColor: '#3182F6',
              arrowColor: '#3182F6',
              textDayFontFamily: 'NotoSansKR_400Regular',
              textMonthFontFamily: 'NotoSansKR_700Bold',
              textDayHeaderFontFamily: 'NotoSansKR_500Medium',
            }}
          />
        )}

        {/* 선택 날짜 이벤트 인라인 리스트 */}
        <View style={{ padding: 16, gap: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#191F28' }}>
            {selectedDate} 일정
          </Text>
          {dayEvents.length === 0 ? (
            <Text style={{ fontSize: 14, color: '#8B95A1', padding: 8 }}>이날 일정이 없습니다</Text>
          ) : (
            dayEvents.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => router.push(`/events/${e.id}`)}
                style={({ pressed }) => ({
                  padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E5E8EB',
                  backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                })}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#191F28' }} numberOfLines={1}>
                  {e.title}
                </Text>
                <StatusBadge status={e.status} />
              </Pressable>
            ))
          )}
        </View>

        {/* dot 범례 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 32 }}>
          {Object.entries(DOT_COLORS).map(([label, color]) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
              <Text style={{ fontSize: 11, color: '#8B95A1' }}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
