// 전역 에러 바운더리 — 렌더 트리 예외를 잡아 복구 UI 표시.
// Phase 13: Sentry 등 원격 리포팅은 계정/과금 필요 → onError 훅만 열어두고 보류.
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View } from 'react-native';
import { ErrorState } from './ui/ErrorState';

type Props = {
  children: ReactNode;
  // 원격 리포팅 연동 지점 (Sentry 등). 미연동 시 console 로그.
  onError?: (error: Error, info: ErrorInfo) => void;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 기본 동작: 콘솔 기록. 추후 Sentry.captureException(error) 로 교체.
    if (this.props.onError) {
      this.props.onError(error, info);
    } else {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-background dark:bg-background-dark">
          <ErrorState
            title="앱에 문제가 발생했어요"
            message="잠시 후 다시 시도해 주세요. 계속되면 앱을 재시작해 주세요."
            retryLabel="다시 시도"
            onRetry={this.reset}
          />
        </View>
      );
    }
    return this.props.children;
  }
}
