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

export async function getDeckById(deckId: string, userId: string) {
  return prisma.deck.findFirst({
    where: { id: deckId, userId },
    include: {
      cards: { orderBy: { createdAt: 'asc' } },
    },
  });
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
