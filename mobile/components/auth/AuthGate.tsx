// 세션 상태에 따라 (auth) ↔ (tabs) 강제 라우팅
import { useRouter, useSegments } from 'expo-router';
import { useEffect, type PropsWithChildren } from 'react';
import { useAuthStore } from '@/stores/authStore';

type RouteInputs = {
  initializing: boolean;
  hasSession: boolean;
  inAuthGroup: boolean;
};

// 순수함수 — 테스트용 export
export function decideAuthRoute(inputs: RouteInputs): '/(auth)/login' | '/(tabs)' | null {
  if (inputs.initializing) return null;
  if (!inputs.hasSession) return inputs.inAuthGroup ? null : '/(auth)/login';
  return inputs.inAuthGroup ? '/(tabs)' : null;
}

export function AuthGate({ children }: PropsWithChildren) {
  const session = useAuthStore((s) => s.session);
  const initializing = useAuthStore((s) => s.initializing);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const target = decideAuthRoute({
      initializing,
      hasSession: !!session,
      inAuthGroup,
    });
    if (target) router.replace(target);
  }, [session, initializing, segments, router]);

  return <>{children}</>;
}
