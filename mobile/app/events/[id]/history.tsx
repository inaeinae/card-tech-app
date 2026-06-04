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
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

// 상태 도트 컬러 — 라이트/다크 별로 토큰화 (color-not-only 규칙은 라벨 텍스트로 충족)
type ThemeC = (typeof Colors)[keyof typeof Colors];
function getStatusDot(status: string, C: ThemeC): string {
  switch (status) {
    case 'applied':
      return C.primary;
    case 'in_progress':
    case 'performance_done':
      return C.warning;
    case 'paid':
      return C.accent;
    case 'cancelable':
    case 'canceled':
      return C.danger;
    case 'registered':
    case 'pending_payout':
    default:
      return C.ink3;
  }
}

export default function EventHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];
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
      <View className="flex-row items-center px-2 h-14 gap-1">
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          className="w-10 h-10 rounded-full bg-surface dark:bg-surface-dark items-center justify-center active:opacity-80"
        >
          <ChevronLeft size={20} color={C.ink} />
        </Pressable>
        <Text className="text-[18px] font-bold text-ink dark:text-ink-dark ml-1">상태 이력</Text>
      </View>

      {history.length === 0 ? (
        <EmptyState title="이력이 없습니다" />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          {history.map((h, idx) => {
            const dotColor = getStatusDot(h.to_status, C);
            const isLast = idx === history.length - 1;
            return (
              <View key={h.id} className="flex-row gap-4">
                {/* 타임라인 축 */}
                <View className="items-center w-5">
                  <View
                    className="w-3 h-3 rounded-full mt-1"
                    style={{ backgroundColor: dotColor }}
                  />
                  {!isLast && (
                    <View className="w-0.5 flex-1 mt-1 bg-border-strong dark:bg-border-strong-dark" />
                  )}
                </View>

                {/* 이력 내용 */}
                <View className="flex-1 pb-6 gap-1">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-label font-bold text-ink dark:text-ink-dark">
                      {EVENT_STATUS_LABEL[h.to_status]}
                    </Text>
                    <View
                      className={`px-2 py-[3px] rounded-full ${
                        h.is_auto
                          ? 'bg-primary-soft dark:bg-primary-darkSoft'
                          : 'bg-surface-2 dark:bg-surface-2-dark'
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${
                          h.is_auto
                            ? 'text-primary dark:text-primary-dark'
                            : 'text-ink-3 dark:text-ink-3-dark'
                        }`}
                      >
                        {h.is_auto ? '자동' : '수동'}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-caption text-ink-3 dark:text-ink-3-dark">
                    {h.from_status
                      ? `${EVENT_STATUS_LABEL[h.from_status]} → ${EVENT_STATUS_LABEL[h.to_status]}`
                      : `등록 → ${EVENT_STATUS_LABEL[h.to_status]}`}
                  </Text>

                  {h.reason ? (
                    <Text className="text-caption text-ink-2 dark:text-ink-2-dark">{h.reason}</Text>
                  ) : null}

                  <Text className="text-caption text-ink-4 dark:text-ink-4-dark">
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
