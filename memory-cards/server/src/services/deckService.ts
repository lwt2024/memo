import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createDeck(userId: string, name: string, description?: string) {
  return prisma.deck.create({
    data: { userId, name, description },
  });
}

export async function getUserDecks(userId: string) {
  return prisma.deck.findMany({
    where: { userId },
    include: {
      _count: { select: { cards: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDeckById(deckId: string, userId: string, filters?: {
  sortBy?: 'createdAt' | 'masteryLevel';
  sortOrder?: 'asc' | 'desc';
  masteryLevel?: number;
}) {
  const whereClause: any = { id: deckId, userId };
  
  const cardsInclude: any = {
    reviewRecords: {
      where: { userId },
    },
    cardTags: {
      include: { tag: true },
    },
  };
  
  let orderByClause: any = {};
  
  if (filters?.sortBy === 'masteryLevel') {
    // 对于按掌握程度排序，我们需要在获取后处理
    orderByClause = { createdAt: filters.sortOrder || 'asc' };
  } else {
    orderByClause = { createdAt: filters.sortOrder || 'asc' };
  }

  const deck = await prisma.deck.findFirst({
    where: whereClause,
    include: {
      cards: {
        include: cardsInclude,
        orderBy: orderByClause,
      },
    },
  });

  if (deck) {
    // 处理卡片数据，添加 reviewRecord 并进行筛选
    deck.cards = deck.cards.map(card => {
      const reviewRecord = card.reviewRecords[0];
      // @ts-ignore
      delete card.reviewRecords;
      return {
        ...card,
        reviewRecord,
      };
    });

    // 按掌握程度筛选
    if (filters?.masteryLevel !== undefined) {
      deck.cards = deck.cards.filter(card => {
        // @ts-ignore
        const mastery = card.reviewRecord?.masteryLevel ?? 0;
        return mastery === filters.masteryLevel;
      });
    }

    // 按掌握程度排序
    if (filters?.sortBy === 'masteryLevel') {
      deck.cards.sort((a, b) => {
        // @ts-ignore
        const aMastery = a.reviewRecord?.masteryLevel ?? 0;
        // @ts-ignore
        const bMastery = b.reviewRecord?.masteryLevel ?? 0;
        return filters.sortOrder === 'desc' ? bMastery - aMastery : aMastery - bMastery;
      });
    }
  }

  return deck;
}

export async function updateDeck(deckId: string, userId: string, data: { name?: string; description?: string }) {
  return prisma.deck.updateMany({
    where: { id: deckId, userId },
    data,
  });
}

export async function deleteDeck(deckId: string, userId: string) {
  return prisma.deck.deleteMany({
    where: { id: deckId, userId },
  });
}
