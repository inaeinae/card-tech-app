// 이벤트 수동 상태 변경 바텀시트 모달
// Pencil frame 참조 — 현재 상태 표시 + 전이 가능 상태 선택
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEventStore } from '@/stores/eventStore';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { EVENT_STATUS_LABEL, type EventStatus } from '@/types/models';
import { ALLOWED_TRANSITIONS, canTransition } from '@/lib/eventStatus';
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

// 상태 도트 컬러 — 라이트/다크 토큰 매핑 (텍스트 라벨 병기로 color-not-only 충족)
type ThemeC = (typeof Colors)[keyof typeof Colors];
function getStatusColor(status: string, C: ThemeC): string {
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

// 최종 수령 완료 상태를 추천으로 강조
const RECOMMENDED: EventStatus[] = ['paid'];

export default function StatusChangeModal() {
  const { id, current } = useLocalSearchParams<{ id: string; current: EventStatus }>();
  const router = useRouter();
  const changeStatus = useEventStore((s) => s.changeStatus);
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];
  const [loading, setLoading] = useState(false);

  const options = (ALLOWED_TRANSITIONS[current] ?? []) as EventStatus[];

  async function onSelect(to: EventStatus) {
    if (!canTransition(current, to)) return;
    setLoading(true);
    try {
      await changeStatus(id, to, false);
      router.back();
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaScreen
      edges={['top', 'bottom', 'left', 'right']}
      className="bg-[rgba(25,31,40,0.5)] dark:bg-[rgba(0,0,0,0.6)]"
      viewProps={{ style: { justifyContent: 'flex-end' } }}
    >
      <View className="bg-bg dark:bg-bg-dark rounded-t-xl px-6 pt-6 pb-10 gap-4">
        <Text className="text-[18px] font-bold text-ink dark:text-ink-dark">상태 변경</Text>

        {/* 현재 상태 */}
        <View className="flex-row items-center gap-2">
          <View className="bg-primary-soft dark:bg-primary-darkSoft rounded-full px-2.5 py-1">
            <Text className="text-caption font-semibold text-primary dark:text-primary-dark">
              현재
            </Text>
          </View>
          <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
            {EVENT_STATUS_LABEL[current]}
          </Text>
        </View>

        {/* 전이 가능 상태 목록 */}
        <View className="gap-2">
          {options.length === 0 ? (
            <Text className="text-label text-ink-3 dark:text-ink-3-dark text-center py-2">
              변경 가능한 상태가 없습니다.
            </Text>
          ) : (
            options.map((status) => {
              const dot = getStatusColor(status, C);
              const isRec = RECOMMENDED.includes(status);
              return (
                <Pressable
                  key={status}
                  onPress={() => onSelect(status)}
                  disabled={loading}
                  className="flex-row items-center justify-between p-4 rounded-[14px] border-[1.5px] border-border-strong dark:border-border-strong-dark bg-bg dark:bg-surface-dark"
                >
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dot }} />
                    <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
                      {EVENT_STATUS_LABEL[status]}
                    </Text>
                  </View>
                  {isRec && (
                    <View className="bg-accent-soft dark:bg-accent-darkSoft rounded-full px-2 py-[3px]">
                      <Text className="text-[11px] font-bold text-accent dark:text-accent-dark">
                        추천
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        <Pressable onPress={() => router.back()} className="items-center p-2">
          <Text className="text-[15px] font-semibold text-ink-3 dark:text-ink-3-dark">취소</Text>
        </Pressable>
      </View>
    </SafeAreaScreen>
  );
}
