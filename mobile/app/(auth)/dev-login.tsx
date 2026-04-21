// __DEV__ 전용 이메일/비밀번호 로그인 화면 — 릴리즈 빌드에서는 라우트 미등록
import { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { signInWithDevEmail, signUpWithDevEmail } from '@/lib/devAuth';

export default function DevLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('dev@kakao.local');
  const [password, setPassword] = useState('devpass1234');
  const [loading, setLoading] = useState(false);

  if (!__DEV__) return <Redirect href="/(auth)/login" />;

  const run = async (fn: () => Promise<unknown>) => {
    setLoading(true);
    try {
      await fn();
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('실패', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark px-6 pt-16 gap-4">
      <Text className="text-foreground dark:text-foreground-dark text-title font-bold">
        개발자 로그인
      </Text>
      <Text className="text-muted dark:text-muted-dark text-caption">
        로컬 Supabase 전용. 릴리즈 빌드에서는 숨김.
      </Text>
      <Input label="이메일" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <Input label="비밀번호" value={password} onChangeText={setPassword} secureTextEntry />
      <Button
        label="로그인"
        loading={loading}
        onPress={() => run(() => signInWithDevEmail(email, password))}
      />
      <Button
        label="회원가입"
        variant="secondary"
        loading={loading}
        onPress={() => run(() => signUpWithDevEmail(email, password))}
      />
    </View>
  );
}
