// 로그인 진입 화면 — 카카오 메인 + __DEV__ 백도어
import { useState } from 'react';
import { View, Text, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { KakaoLoginButton } from '@/components/auth/KakaoLoginButton';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleKakao = async () => {
    setLoading(true);
    try {
      // Task 8 에서 실제 SDK 연동 — 지금은 명시적 에러
      throw new Error('카카오 SDK 연결 예정 (Task 8)');
    } catch (e) {
      Alert.alert('안내', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark px-6 pt-24 gap-6">
      <View className="gap-2">
        <Text className="text-foreground dark:text-foreground-dark text-display font-bold">
          카테크
        </Text>
        <Text className="text-muted dark:text-muted-dark text-body">
          카드사 이벤트를 놓치지 마세요.
        </Text>
      </View>

      <View className="gap-3 mt-auto mb-12">
        <KakaoLoginButton onPress={handleKakao} loading={loading} />
        {__DEV__ && (
          <Pressable
            onPress={() => router.push('/(auth)/dev-login')}
            accessibilityRole="button"
            className="py-3 items-center"
          >
            <Text className="text-muted dark:text-muted-dark text-caption underline">
              개발자 로그인 (로컬 전용)
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
