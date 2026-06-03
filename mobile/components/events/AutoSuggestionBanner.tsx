// 자동 상태 제안 배너 — 1탭 확정 (Phase 7)
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { EVENT_STATUS_LABEL, type EventStatus } from '@/types/models';
import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

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
  const C = Colors[useResolvedColorScheme()];

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
      className="mx-4 mb-3 p-3.5 rounded-2xl bg-primary-soft dark:bg-primary-darkSoft flex-row items-center gap-3"
      accessibilityRole="alert"
      accessibilityLabel={`자동 제안: ${EVENT_STATUS_LABEL[suggested]} 로 변경`}
    >
      <Sparkles size={18} color={C.primary} />
      <View className="flex-1">
        <Text className="text-[13px] font-semibold text-primary dark:text-primary-dark">
          {COPY[suggested]}
        </Text>
        <Text className="text-[14px] font-bold text-ink dark:text-ink-dark mt-0.5">
          &apos;{EVENT_STATUS_LABEL[suggested]}&apos; 로 변경할까요?
        </Text>
      </View>
      <Pressable
        onPress={handle}
        disabled={busy}
        className="px-3.5 py-2 min-h-[44px] items-center justify-center rounded-full bg-primary dark:bg-primary-dark active:opacity-80"
        style={{ opacity: busy ? 0.6 : 1 }}
        accessibilityRole="button"
        accessibilityLabel={`${EVENT_STATUS_LABEL[suggested]} 로 변경 확정`}
        accessibilityState={{ disabled: busy, busy }}
      >
        <Text className="text-[13px] font-bold text-white">{busy ? '확정 중…' : '확정'}</Text>
      </Pressable>
    </View>
  );
}
