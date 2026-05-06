import { View, Text, Pressable } from 'react-native';
import { Sparkles, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type Props = {
  onRegister: () => void;
};

export default function EmptyHome({ onRegister }: Props) {
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 }}>
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 32,
          backgroundColor: '#E8F2FE',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Sparkles size={60} color="#3182F6" />
      </View>

      <Text style={{ fontSize: 24, fontWeight: '700', color: '#191F28', textAlign: 'center', lineHeight: 34 }}>
        {'첫 이벤트를\n등록해 보세요'}
      </Text>
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#8B95A1', textAlign: 'center', lineHeight: 22 }}>
        캐시백 일정과 금액을 자동으로 관리해드려요
      </Text>

      <Pressable
        onPress={onRegister}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: pressed ? '#1B64DA' : '#3182F6',
          borderRadius: 14,
          paddingHorizontal: 24,
          paddingVertical: 16,
          marginTop: 8,
          alignSelf: 'stretch',
          justifyContent: 'center',
        })}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>이벤트 등록하기</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/cards/new')}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#3182F6' }}>먼저 카드 등록부터 →</Text>
      </Pressable>
    </View>
  );
}
