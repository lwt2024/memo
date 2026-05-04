import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createCard(
  deckId: string,
  userId: string,
  front: string,
  back: string,
  cardType: string = 'text',
  mediaUrls?: string[]
) {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) {
    throw new Error('卡片组不存在');
  }

  return prisma.card.create({
    data: { deckId, front, back, cardType, mediaUrls },
  });
}

export async function getDeckCards(deckId: string, userId: string) {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) {
    throw new Error('卡片组不存在');
  }

  return prisma.card.findMany({
    where: { deckId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function updateCard(cardId: string, userId: string, data: { front?: string; back?: string; cardType?: string; mediaUrls?: string[] }) {
  const card = await prisma.card.findFirst({
    where: { id: cardId },
    include: { deck: true },
  });
  if (!card || card.deck.userId !== userId) {
    throw new Error('卡片不存在');
  }

  return prisma.card.update({
    where: { id: cardId },
    data,
  });
}

export async function deleteCard(cardId: string, userId: string) {
  const card = await prisma.card.findFirst({
    where: { id: cardId },
    include: { deck: true },
  });
  if (!card || card.deck.userId !== userId) {
    throw new Error('卡片不存在');
  }

  return prisma.card.delete({ where: { id: cardId } });
}
