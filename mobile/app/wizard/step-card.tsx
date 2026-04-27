// Step 1 — 카드 선택. 보유 카드 리스트 + 새 카드 등록 진입.
// UI_STRUCTURE.md §8.1 wireframe.
import { useEffect } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardListItem } from '@/components/cards/CardListItem';
import { useCardStore } from '@/stores/cardStore';
import { useWizardStore } from '@/stores/wizardStore';
import { computeReuseWarning } from '@/lib/eventForm';

export default function WizardStepCard() {
  const router = useRouter();
  const cards = useCardStore((s) => s.cards.filter((c) => !c.canceled_at));
  const loadCards = useCardStore((s) => s.loadCards);
  const draft = useWizardStore((s) => s.draft);
  const patchDraft = useWizardStore((s) => s.patchDraft);
  const setStep = useWizardStore((s) => s.setStep);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 gap-3">
        <Text className="text-headline font-bold text-foreground dark:text-foreground-dark">
          카드를 선택하세요
        </Text>
        <Text className="text-body text-muted dark:text-muted-dark">
          어떤 카드의 이벤트인가요?
        </Text>

        {cards.length === 0 ? (
          <EmptyState
            title="등록된 카드가 없습니다"
            actionLabel="새 카드 등록"
            onAction={() => router.push('/cards/new')}
          />
        ) : (
          <FlatList
            scrollEnabled={false}
            data={cards}
            keyExtractor={(c) => c.id}
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={({ item }) => {
              const selected = draft.cardId === item.id;
              const warn = computeReuseWarning({
                lastEventAt: item.last_event_at,
                today,
              });
              return (
                <Pressable
                  onPress={() => patchDraft({ cardId: item.id })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  hitSlop={4}
                  className={`rounded-md border ${
                    selected
                      ? 'border-primary dark:border-primary-dark'
                      : 'border-border dark:border-border-dark'
                  }`}
                >
                  <CardListItem card={item} variant="row" />
                  {warn ? (
                    <Text className="px-3 pb-3 text-caption text-amber-700 dark:text-amber-300">
                      ⚠ {warn.message}
                    </Text>
                  ) : null}
                </Pressable>
              );
            }}
          />
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="새 카드 등록"
          hitSlop={8}
          onPress={() => router.push('/cards/new')}
          className="mt-2 flex-row items-center justify-center gap-2 h-12 rounded-md bg-surface dark:bg-surface-dark border border-border dark:border-border-dark"
        >
          <Plus size={18} color="#94A3B8" />
          <Text className="text-body text-foreground dark:text-foreground-dark">
            새 카드 등록
          </Text>
        </Pressable>

        <Button
          label="다음"
          disabled={!draft.cardId}
          onPress={() => {
            setStep(2);
            router.push('/wizard/step-info');
          }}
        />
      </View>
    </ScrollView>
  );
}
