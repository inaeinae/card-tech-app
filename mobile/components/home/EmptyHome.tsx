import { View, Text, Pressable } from 'react-native';
import { Sparkles, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import { Colors } from '@/constants/theme';

type Props = {
  onRegister: () => void;
};

export default function EmptyHome({ onRegister }: Props) {
  const router = useRouter();
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];

  return (
    <View className="flex-1 items-center justify-center px-8 gap-4">
      <View className="w-[120px] h-[120px] rounded-[32px] bg-primary-soft dark:bg-primary-darkSoft items-center justify-center">
        <Sparkles size={60} color={C.primary} />
      </View>

      <Text
        className="text-[24px] font-bold text-ink dark:text-ink-dark text-center"
        style={{ lineHeight: 34 }}
      >
        {'첫 이벤트를\n등록해 보세요'}
      </Text>
      <Text
        className="text-label font-medium text-ink-3 dark:text-ink-3-dark text-center"
        style={{ lineHeight: 22 }}
      >
        캐시백 일정과 금액을 자동으로 관리해드려요
      </Text>

      {/* Pressable 함수형 style 제거 — RN 0.81 회귀 fix. pressed 효과 필요 시 className 변형 권장 */}
      <Pressable
        onPress={onRegister}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: C.primary,
          borderRadius: 14,
          paddingHorizontal: 24,
          paddingVertical: 16,
          marginTop: 8,
          alignSelf: 'stretch',
          justifyContent: 'center',
        }}
      >
        <Plus size={20} color="#FFFFFF" />
        <Text className="text-[16px] font-bold text-white">이벤트 등록하기</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/cards/new')}>
        <Text className="text-label font-semibold text-primary">먼저 카드 등록부터 →</Text>
      </Pressable>
    </View>
  );
}
