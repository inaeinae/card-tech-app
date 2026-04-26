// 가로 스크롤 캐러셀 — Phase 8 홈 탭 재사용
// 빈 상태는 EmptyState 로 위임
import { FlatList } from 'react-native';
import { CardListItem } from './CardListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Card } from '@/types/models';

type Props = {
  cards: Card[];
  onPressCard: (card: Card) => void;
  emptyTitle?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
};

export function CardCarousel({
  cards,
  onPressCard,
  emptyTitle = '등록된 카드가 없습니다',
  emptyActionLabel,
  onEmptyAction,
}: Props) {
  if (cards.length === 0) {
    return (
      <EmptyState title={emptyTitle} actionLabel={emptyActionLabel} onAction={onEmptyAction} />
    );
  }
  return (
    <FlatList
      data={cards}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      keyExtractor={(c) => c.id}
      renderItem={({ item }) => (
        <CardListItem card={item} variant="carousel" onPress={() => onPressCard(item)} />
      )}
    />
  );
}
