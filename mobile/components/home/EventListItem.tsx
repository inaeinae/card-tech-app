import { Pressable, View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { EventStatus } from '@/types/models';

type Props = {
  id: string;
  title: string;
  issuer: string;
  status: EventStatus;
  expectedAmount: number;
  onPress: () => void;
};

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
  const barColor = ISSUER_COLORS[issuer] ?? '#3182F6';
  const fmt = (n: number) => `₩${n.toLocaleString('ko-KR')}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E8EB',
        marginHorizontal: 16,
        marginBottom: 8,
        gap: 12,
      })}
    >
      {/* 카드사 컬러 바 */}
      <View style={{ width: 4, height: 40, borderRadius: 999, backgroundColor: barColor }} />

      {/* 이벤트 정보 */}
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#191F28' }} numberOfLines={1}>
          {title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 13, color: '#8B95A1' }}>{issuer}</Text>
          <StatusBadge status={status} />
        </View>
      </View>

      {/* 금액 + chevron */}
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#191F28' }}>
          {fmt(expectedAmount)}
        </Text>
        <ChevronRight size={16} color="#B0B8C1" />
      </View>
    </Pressable>
  );
}
