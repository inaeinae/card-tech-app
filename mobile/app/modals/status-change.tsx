// 이벤트 수동 상태 변경 바텀시트 모달
// Pencil frame 참조 — 현재 상태 표시 + 전이 가능 상태 선택
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEventStore } from '@/stores/eventStore';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { EVENT_STATUS_LABEL, type EventStatus } from '@/types/models';
import { ALLOWED_TRANSITIONS, canTransition } from '@/lib/eventStatus';

const STATUS_PALETTE: Record<string, { bg: string; text: string; dot: string }> = {
  registered: { bg: '#F2F4F6', text: '#4E5968', dot: '#8B95A1' },
  applied: { bg: '#E8F2FE', text: '#3182F6', dot: '#3182F6' },
  in_progress: { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
  performance_done: { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
  pending_payout: { bg: '#F2F4F6', text: '#4E5968', dot: '#8B95A1' },
  paid: { bg: '#E5FAF3', text: '#0F8568', dot: '#19D294' },
  cancelable: { bg: '#FFF1F0', text: '#FF4D4F', dot: '#FF4D4F' },
  canceled: { bg: '#FFF1F0', text: '#FF4D4F', dot: '#FF4D4F' },
};

// 최종 수령 완료 상태를 추천으로 강조
const RECOMMENDED: EventStatus[] = ['paid'];

export default function StatusChangeModal() {
  const { id, current } = useLocalSearchParams<{ id: string; current: EventStatus }>();
  const router = useRouter();
  const changeStatus = useEventStore((s) => s.changeStatus);
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
      className="bg-[rgba(25,31,40,0.5)]"
      viewProps={{ style: { justifyContent: 'flex-end' } }}
    >
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          paddingBottom: 40,
          gap: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#191F28' }}>상태 변경</Text>

        {/* 현재 상태 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              backgroundColor: '#E8F2FE',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#3182F6' }}>현재</Text>
          </View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#191F28' }}>
            {EVENT_STATUS_LABEL[current]}
          </Text>
        </View>

        {/* 전이 가능 상태 목록 */}
        <View style={{ gap: 8 }}>
          {options.length === 0 ? (
            <Text
              style={{ fontSize: 14, color: '#8B95A1', textAlign: 'center', paddingVertical: 8 }}
            >
              변경 가능한 상태가 없습니다.
            </Text>
          ) : (
            options.map((status) => {
              const pal = STATUS_PALETTE[status] ?? STATUS_PALETTE.registered;
              const isRec = RECOMMENDED.includes(status);
              return (
                <Pressable
                  key={status}
                  onPress={() => onSelect(status)}
                  disabled={loading}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 16,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: pressed ? pal.dot : '#E5E8EB',
                    backgroundColor: pressed ? pal.bg : '#FFFFFF',
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View
                      style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: pal.dot }}
                    />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#191F28' }}>
                      {EVENT_STATUS_LABEL[status]}
                    </Text>
                  </View>
                  {isRec && (
                    <View
                      style={{
                        backgroundColor: '#E5FAF3',
                        borderRadius: 999,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F8568' }}>
                        추천
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>

        <Pressable onPress={() => router.back()} style={{ alignItems: 'center', padding: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#8B95A1' }}>취소</Text>
        </Pressable>
      </View>
    </SafeAreaScreen>
  );
}
