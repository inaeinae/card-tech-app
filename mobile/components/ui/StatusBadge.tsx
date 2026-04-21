// 이벤트 상태 배지 — UI_STRUCTURE.md §3 색상 매핑
import { Text, View } from 'react-native';
import type { EventStatus } from '@/types/models';
import { EVENT_STATUS_LABEL } from '@/types/models';

type Props = {
  status: EventStatus;
};

// 라이트·다크 모두 대비 4.5:1 유지 — color-not-only 규칙 준수 (텍스트 병기)
const statusColor: Record<EventStatus, { bg: string; text: string; dot: string }> = {
  registered: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-500 dark:bg-slate-400',
  },
  applied: {
    bg: 'bg-blue-50 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500 dark:bg-blue-400',
  },
  in_progress: {
    bg: 'bg-amber-50 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  performance_done: {
    bg: 'bg-orange-50 dark:bg-orange-900/40',
    text: 'text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500 dark:bg-orange-400',
  },
  pending_payout: {
    bg: 'bg-violet-50 dark:bg-violet-900/40',
    text: 'text-violet-700 dark:text-violet-300',
    dot: 'bg-violet-500 dark:bg-violet-400',
  },
  paid: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
  },
  cancelable: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    dot: 'bg-gray-500 dark:bg-gray-400',
  },
  canceled: {
    bg: 'bg-red-50 dark:bg-red-900/40',
    text: 'text-red-600 dark:text-red-300',
    dot: 'bg-red-400 dark:bg-red-300',
  },
};

export function StatusBadge({ status }: Props) {
  const label = EVENT_STATUS_LABEL[status];
  const color = statusColor[status];

  return (
    <View
      className={`self-start flex-row items-center gap-1.5 rounded-xs px-2 py-1 ${color.bg}`}
      accessibilityLabel={`이벤트 상태: ${label}`}
    >
      <View className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
      <Text className={`text-caption font-medium ${color.text}`}>{label}</Text>
    </View>
  );
}
