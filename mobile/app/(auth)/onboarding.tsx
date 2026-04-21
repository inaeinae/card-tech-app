// 첫 실행 온보딩 — 3단계 가로 스와이프
import { useRef, useState } from 'react';
import { View, Text, Pressable, FlatList, Dimensions, type ViewToken } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const SLIDES = [
  {
    title: '이벤트 한눈에',
    body: '응모 · 이용 · 지급까지 상태를 한곳에서.',
  },
  {
    title: '실적 놓치지 않게',
    body: '마감 D-1, 실적 15/말일 자동 알림.',
  },
  {
    title: '예상 vs 실제',
    body: '받을 돈을 월/카드사별로 집계.',
  },
];

const { width } = Dimensions.get('window');
export const ONBOARDING_KEY = 'catech.onboardingSeen.v1';

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewable = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  };

  const next = async () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
      return;
    }
    await SecureStore.setItemAsync(ONBOARDING_KEY, '1');
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-background dark:bg-background-dark">
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => `${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={{ width }} className="px-8 justify-center gap-3">
            <Text className="text-foreground dark:text-foreground-dark text-display font-bold">
              {item.title}
            </Text>
            <Text className="text-muted dark:text-muted-dark text-body">{item.body}</Text>
          </View>
        )}
      />
      <View className="flex-row justify-center gap-2 mb-6">
        {SLIDES.map((_, i) => (
          <View
            key={i}
            className={`h-2 rounded-full ${
              i === index ? 'w-6 bg-primary dark:bg-primary-dark' : 'w-2 bg-border dark:bg-border-dark'
            }`}
          />
        ))}
      </View>
      <View className="px-6 pb-12">
        <Pressable
          onPress={next}
          accessibilityRole="button"
          className="min-h-[52px] rounded-md bg-primary dark:bg-primary-dark items-center justify-center"
        >
          <Text className="text-white font-bold text-body">
            {index < SLIDES.length - 1 ? '다음' : '시작하기'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
