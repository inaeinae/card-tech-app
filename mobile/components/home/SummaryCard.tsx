import { View, Text } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

type Props = {
  confirmedAmount: number;
  expectedAmount: number;
};

// 이용금액(spend) 표시 금지 — 금융연동 부재 (Phase 10 원칙)
export default function SummaryCard({ confirmedAmount, expectedAmount }: Props) {
  const fmt = (n: number) => `₩${n.toLocaleString('ko-KR')}`;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        padding: 24,
        backgroundColor: '#191F28',
      }}
    >
      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500' }}>
        이번 달 예상 수령
      </Text>
      <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 4 }}>
        {fmt(confirmedAmount + expectedAmount)}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <TrendingUp size={12} color="#19D294" />
          <Text style={{ color: '#19D294', fontSize: 12, fontWeight: '600' }}>
            확정 {fmt(confirmedAmount)}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' }}>
            예상 +{fmt(expectedAmount)}
          </Text>
        </View>
      </View>
    </View>
  );
}
