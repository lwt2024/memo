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
  
  const sortOrder = filters?.sortOrder || 'asc';
  if (filters?.sortBy === 'masteryLevel') {
    orderByClause = { createdAt: sortOrder };
  } else {
    orderByClause = { createdAt: sortOrder };
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
    (deck.cards as any) = deck.cards.map(card => {
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
      (deck.cards as any) = deck.cards.filter((card: any) => {
        const mastery = card.reviewRecord?.masteryLevel ?? 0;
        return mastery === filters.masteryLevel;
      });
    }

    // 按掌握程度排序
    if (filters?.sortBy === 'masteryLevel') {
      (deck.cards as any).sort((a: any, b: any) => {
        const aMastery = a.reviewRecord?.masteryLevel ?? 0;
        const bMastery = b.reviewRecord?.masteryLevel ?? 0;
        return sortOrder === 'desc' ? bMastery - aMastery : aMastery - bMastery;
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

export async function getDeckStats(deckId: string, userId: string) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [cards, todayReviews] = await Promise.all([
    prisma.card.findMany({
      where: { deckId, deck: { userId } },
      include: {
        reviewRecords: { where: { userId } },
      },
    }),
    prisma.reviewRecord.count({
      where: {
        card: { deckId },
        userId,
        lastReviewAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    }),
  ]);

  let learningCount = 0;
  let masteredCount = 0;
  let notLearnedCount = 0;
  let difficultCount = 0;
  let dueReviewCount = 0;
  let todayNewCount = 0;

  cards.forEach(card => {
    const reviewRecord = card.reviewRecords[0];
    const masteryLevel = reviewRecord?.masteryLevel ?? 0;
    const nextReviewAt = reviewRecord?.nextReviewAt;

    if (masteryLevel === 0) {
      notLearnedCount++;
      todayNewCount++;
    } else if (masteryLevel <= 2) {
      learningCount++;
    } else {
      masteredCount++;
    }

    if (reviewRecord?.reviewCount >= 3 && reviewRecord.easeLevel <= 2) {
      difficultCount++;
    }

    if (nextReviewAt && nextReviewAt <= now) {
      dueReviewCount++;
    }
  });

  const totalCards = cards.length;
  const masteredPercent = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;
  const estimatedMinutes = Math.ceil((dueReviewCount + todayNewCount) * 0.5);

  return {
    totalCards,
    learningCount,
    masteredCount,
    notLearnedCount,
    difficultCount,
    dueReviewCount,
    todayNewCount,
    todayReviewedCount: todayReviews,
    masteredPercent,
    estimatedMinutes,
  };
}
