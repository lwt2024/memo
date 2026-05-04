import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_INTERVALS = [1, 2, 4, 7, 15, 30];

function calculateNextReview(easeLevel: number, reviewCount: number): Date {
  const baseDays = BASE_INTERVALS[Math.min(reviewCount, BASE_INTERVALS.length - 1)];
  let multiplier = 1;

  switch (easeLevel) {
    case 1:
      multiplier = 0.5;
      break;
    case 2:
      multiplier = 0.7;
      break;
    case 3:
      multiplier = 1;
      break;
    case 4:
      multiplier = 1.3;
      break;
    case 5:
      multiplier = 1.5;
      break;
  }

  const days = Math.round(baseDays * multiplier);
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + (easeLevel === 1 ? 0.5 : days));

  return nextDate;
}

export async function getDueCards(userId: string) {
  const now = new Date();

  return prisma.card.findMany({
    where: {
      deck: { userId },
      OR: [
        { reviewRecords: { none: { userId } } },
        {
          reviewRecords: {
            some: {
              userId,
              nextReviewAt: { lte: now },
            },
          },
        },
      ],
    },
    include: {
      deck: true,
      reviewRecords: { where: { userId } },
    },
  });
}

export async function getDeckReviewCards(deckId: string, userId: string) {
  const now = new Date();

  return prisma.card.findMany({
    where: {
      deckId,
      deck: { userId },
      OR: [
        { reviewRecords: { none: { userId } } },
        {
          reviewRecords: {
            some: {
              userId,
              nextReviewAt: { lte: now },
            },
          },
        },
      ],
    },
    include: {
      reviewRecords: { where: { userId } },
    },
  });
}

export async function submitReview(cardId: string, userId: string, easeLevel: number) {
  const card = await prisma.card.findFirst({
    where: { id: cardId, deck: { userId } },
    include: { reviewRecords: { where: { userId } } },
  });

  if (!card) {
    throw new Error('卡片不存在');
  }

  const existingRecord = card.reviewRecords[0];
  const reviewCount = existingRecord ? existingRecord.reviewCount + 1 : 1;
  const nextReviewAt = calculateNextReview(easeLevel, reviewCount);

  if (existingRecord) {
    return prisma.reviewRecord.update({
      where: { id: existingRecord.id },
      data: {
        easeLevel,
        lastReviewAt: new Date(),
        nextReviewAt,
        reviewCount,
      },
    });
  } else {
    return prisma.reviewRecord.create({
      data: {
        cardId,
        userId,
        easeLevel,
        lastReviewAt: new Date(),
        nextReviewAt,
        reviewCount,
      },
    });
  }
}

export async function getReviewStats(userId: string) {
  const now = new Date();

  const [dueCount, learningCount, masteredCount] = await Promise.all([
    prisma.card.count({
      where: {
        deck: { userId },
        reviewRecords: {
          some: { userId, nextReviewAt: { lte: now } },
        },
      },
    }),
    prisma.card.count({
      where: {
        deck: { userId },
        reviewRecords: { some: { userId } },
      },
    }),
    prisma.card.count({
      where: {
        deck: { userId },
        reviewRecords: {
          some: { userId, reviewCount: { gte: 5 } },
        },
      },
    }),
  ]);

  const totalNew = await prisma.card.count({
    where: {
      deck: { userId },
      reviewRecords: { none: { userId } },
    },
  });

  return { dueCount, learningCount, masteredCount, newCount: totalNew };
}
