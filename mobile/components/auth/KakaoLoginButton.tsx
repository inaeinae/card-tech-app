// 카카오 브랜드 버튼 — 공식 가이드 준수 (노란색 #FEE500, 검정 텍스트, 최소 44pt)
import { Pressable, Text, ActivityIndicator, View } from 'react-native';

type Props = {
  onPress: () => void;
  loading?: boolean;
};

export function KakaoLoginButton({ onPress, loading }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="카카오로 로그인"
      accessibilityState={{ disabled: loading, busy: loading }}
      className="w-full min-h-[52px] rounded-md items-center justify-center flex-row gap-2 active:opacity-80"
      style={{ backgroundColor: '#FEE500' }}
    >
      {loading ? (
        <ActivityIndicator color="#000000" />
      ) : (
        <View className="flex-row items-center gap-2">
          {/* 카카오 말풍선 아이콘 자리 — SDK 에셋 또는 추후 SVG 교체 */}
          <Text style={{ color: '#000000' }} className="font-bold text-body">
            💬
          </Text>
          <Text style={{ color: '#000000' }} className="font-bold text-body">
            카카오로 3초 만에 시작하기
          </Text>
        </View>
      )}
    </Pressable>
  );
}
