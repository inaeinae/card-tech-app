// 이벤트 상태 이력 — 타임라인 뷰
// Pencil frame FCGBU 기반
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { EVENT_STATUS_LABEL } from '@/types/models';
import type { EventStatusHistory } from '@/types/models';

const STATUS_COLOR: Record<string, string> = {
  registered: '#8B95A1',
  applied: '#3182F6',
  in_progress: '#F59E0B',
  performance_done: '#F59E0B',
  pending_payout: '#8B95A1',
  paid: '#19D294',
  cancelable: '#FF4D4F',
  canceled: '#FF4D4F',
};

export default function EventHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [history, setHistory] = useState<EventStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('event_status_history')
      .select('*')
      .eq('event_id', id)
      .order('changed_at', { ascending: false })
      .then(({ data }) => {
        setHistory(data ?? []);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <LoadingState />;

  return (
    <SafeAreaScreen>
      {/* 앱바 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          height: 56,
          gap: 4,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F9FAFB',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronLeft size={20} color="#191F28" />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#191F28', marginLeft: 4 }}>
          상태 이력
        </Text>
      </View>

      {history.length === 0 ? (
        <EmptyState title="이력이 없습니다" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {history.map((h, idx) => {
            const dotColor = STATUS_COLOR[h.to_status] ?? '#8B95A1';
            const isLast = idx === history.length - 1;
            return (
              <View key={h.id} style={{ flexDirection: 'row', gap: 16 }}>
                {/* 타임라인 축 */}
                <View style={{ alignItems: 'center', width: 20 }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: dotColor,
                      marginTop: 4,
                    }}
                  />
                  {!isLast && (
                    <View style={{ width: 2, flex: 1, backgroundColor: '#E5E8EB', marginTop: 4 }} />
                  )}
                </View>

                {/* 이력 내용 */}
                <View style={{ flex: 1, paddingBottom: 24, gap: 4 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#191F28' }}>
                      {EVENT_STATUS_LABEL[h.to_status]}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 999,
                        backgroundColor: h.is_auto ? '#E8F2FE' : '#F2F4F6',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: h.is_auto ? '#3182F6' : '#8B95A1',
                        }}
                      >
                        {h.is_auto ? '자동' : '수동'}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 12, color: '#8B95A1' }}>
                    {h.from_status
                      ? `${EVENT_STATUS_LABEL[h.from_status]} → ${EVENT_STATUS_LABEL[h.to_status]}`
                      : `등록 → ${EVENT_STATUS_LABEL[h.to_status]}`}
                  </Text>

                  {h.reason ? (
                    <Text style={{ fontSize: 12, color: '#4E5968' }}>{h.reason}</Text>
                  ) : null}

                  <Text style={{ fontSize: 12, color: '#B0B8C1' }}>
                    {new Date(h.changed_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaScreen>
  );
}
