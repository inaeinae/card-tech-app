import { Pressable, View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import { Colors } from '@/constants/theme';
import type { EventStatus } from '@/types/models';

type Props = {
  id: string;
  title: string;
  issuer: string;
  status: EventStatus;
  expectedAmount: number;
  onPress: () => void;
};

// 카드사 브랜드 컬러 — 카드사 브랜드는 라이트/다크 공통으로 hex 유지 (브랜드 정체성)
const ISSUER_COLORS: Record<string, string> = {
  BC카드: '#E30547',
  하나카드: '#009B6E',
  신한카드: '#0046FF',
  국민카드: '#FFBC00',
  현대카드: '#000000',
  삼성카드: '#034EA2',
  롯데카드: '#E61E2B',
  우리카드: '#0070C0',
  씨티카드: '#003B8E',
};

export default function EventListItem({ title, issuer, status, expectedAmount, onPress }: Props) {
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];

  const barColor = ISSUER_COLORS[issuer] ?? C.primary;
  const fmt = (n: number) => `₩${n.toLocaleString('ko-KR')}`;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center p-4 bg-bg dark:bg-bg-dark rounded-lg border border-border-strong dark:border-border-strong-dark mx-4 mb-2 gap-3 active:opacity-80"
    >
      {/* 카드사 컬러 바 */}
      <View style={{ width: 4, height: 40, borderRadius: 999, backgroundColor: barColor }} />

      {/* 이벤트 정보 */}
      <View className="flex-1 gap-1">
        <Text className="text-[15px] font-bold text-ink dark:text-ink-dark" numberOfLines={1}>
          {title}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[13px] text-ink-3 dark:text-ink-3-dark">{issuer}</Text>
          <StatusBadge status={status} />
        </View>
      </View>

      {/* 금액 + chevron */}
      <View className="items-end gap-0.5">
        <Text className="text-[15px] font-bold text-ink dark:text-ink-dark">
          {fmt(expectedAmount)}
        </Text>
        <ChevronRight size={16} color={C.ink4} />
      </View>
    </Pressable>
  );
}
