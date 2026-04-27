// wizard 모달 스택 — Step1~4 + 템플릿/하위항목/혜택폼 푸시
// UI_STRUCTURE.md §8 wireframe 기준 — 진행도 ●━●━○━○ Step N/4
import { Alert, Pressable, View, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useWizardStore } from '@/stores/wizardStore';

export default function WizardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#FFFFFF',
        presentation: 'modal',
        headerTitle: () => <ProgressHeader />,
        headerLeft: () => <CloseButton />,
      }}
    >
      <Stack.Screen name="step-card" />
      <Stack.Screen name="step-info" />
      <Stack.Screen name="step-benefits" />
      <Stack.Screen name="step-review" />
      <Stack.Screen
        name="template-picker"
        options={{ presentation: 'modal', headerTitle: '템플릿 선택' }}
      />
      <Stack.Screen
        name="sub-item-picker"
        options={{ presentation: 'modal', headerTitle: '하위 항목 선택' }}
      />
      <Stack.Screen
        name="benefit-form"
        options={{ presentation: 'modal', headerTitle: '혜택 편집' }}
      />
    </Stack>
  );
}

function ProgressHeader() {
  const step = useWizardStore((s) => s.step);
  return (
    <View className="flex-row items-center gap-2">
      {[1, 2, 3, 4].map((n) => (
        <View
          key={n}
          className={`w-2.5 h-2.5 rounded-full ${
            n <= step ? 'bg-primary dark:bg-primary-dark' : 'bg-muted dark:bg-muted-dark'
          }`}
        />
      ))}
      <Text className="text-label text-white ml-2">Step {step} / 4</Text>
    </View>
  );
}

function CloseButton() {
  const router = useRouter();
  const draft = useWizardStore((s) => s.draft);
  const reset = useWizardStore((s) => s.reset);

  function onClose() {
    const dirty =
      Boolean(draft.cardId) || Boolean(draft.title) || draft.benefits.length > 0;
    if (!dirty) {
      reset();
      router.back();
      return;
    }
    Alert.alert('취소하시겠어요?', '입력 중인 내용이 모두 사라집니다.', [
      { text: '계속 작성', style: 'cancel' },
      {
        text: '취소',
        style: 'destructive',
        onPress: () => {
          reset();
          router.back();
        },
      },
    ]);
  }

  return (
    <Pressable
      onPress={onClose}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="위저드 취소"
      className="px-2"
    >
      <X size={24} color="#FFFFFF" />
    </Pressable>
  );
}
