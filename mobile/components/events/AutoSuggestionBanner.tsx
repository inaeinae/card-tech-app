// 자동 상태 제안 배너 — 1탭 확정 (Phase 7)
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { EVENT_STATUS_LABEL, type EventStatus } from '@/types/models';

const COPY: Record<EventStatus, string> = {
  registered: '응모 시작 전이에요',
  applied: '응모 기간이 시작됐어요',
  in_progress: '이용 기간이 시작됐어요',
  performance_done: '이용 기간이 끝났어요',
  pending_payout: '지급 예정일이 됐어요',
  paid: '지급일이 도래했어요',
  cancelable: '해지 가능 시점이 됐어요',
  canceled: '',
};

type Props = {
  suggested: EventStatus;
  onConfirm: () => Promise<void> | void;
};

export function AutoSuggestionBanner({ suggested, onConfirm }: Props) {
  const [busy, setBusy] = useState(false);

  // canceled는 종단 상태 — 제안 배너 불필요
  if (suggested === 'canceled') return null;

  async function handle() {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <View
      style={{
        marginHorizontal: 16, marginBottom: 12, padding: 14,
        borderRadius: 16, backgroundColor: '#E8F2FE',
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}
      accessibilityRole="alert"
      accessibilityLabel={`자동 제안: ${EVENT_STATUS_LABEL[suggested]} 로 변경`}
    >
      <Sparkles size={18} color="#3182F6" />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, color: '#3182F6', fontWeight: '600' }}>
          {COPY[suggested]}
        </Text>
        <Text style={{ fontSize: 14, color: '#191F28', fontWeight: '700', marginTop: 2 }}>
          &apos;{EVENT_STATUS_LABEL[suggested]}&apos; 로 변경할까요?
        </Text>
      </View>
      <Pressable
        onPress={handle}
        disabled={busy}
        style={({ pressed }) => ({
          paddingHorizontal: 14, paddingVertical: 8, minHeight: 44, borderRadius: 999,
          backgroundColor: pressed ? '#1B64DA' : '#3182F6',
          opacity: busy ? 0.6 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel={`${EVENT_STATUS_LABEL[suggested]} 로 변경 확정`}
        accessibilityState={{ disabled: busy, busy }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>
          {busy ? '확정 중…' : '확정'}
        </Text>
      </Pressable>
    </View>
  );
}
