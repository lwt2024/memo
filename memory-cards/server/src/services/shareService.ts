import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function setDeckPublic(deckId: string, userId: string, isPublic: boolean) {
  return prisma.deck.updateMany({
    where: { id: deckId, userId },
    data: { isPublic },
  });
}

export async function generateInviteLink(deckId: string, userId: string) {
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId },
  });

  if (!deck) {
    throw new Error('卡片组不存在');
  }

  const inviteCode = generateInviteCode();
  
  await prisma.deck.update({
    where: { id: deckId },
    data: { inviteCode },
  });

  return {
    inviteCode,
    shareUrl: `/import/${inviteCode}`,
  };
}

export async function importPublicDeck(deckId: string, userId: string) {
  const sourceDeck = await prisma.deck.findFirst({
    where: { id: deckId, isPublic: true },
    include: {
      cards: {
        include: {
          cardTags: { include: { tag: true } },
        },
      },
    },
  });

  if (!sourceDeck) {
    throw new Error('卡片组不存在或未公开');
  }

  if (sourceDeck.userId === userId) {
    throw new Error('不能导入自己的卡片组');
  }

  const existingDeck = await prisma.deck.findFirst({
    where: { userId, name: `${sourceDeck.name} (导入)` },
  });

  if (existingDeck) {
    throw new Error('您已经导入过这个卡片组');
  }

  const newDeck = await prisma.deck.create({
    data: {
      userId,
      name: `${sourceDeck.name} (导入)`,
      description: sourceDeck.description,
    },
  });

  for (const card of sourceDeck.cards) {
    const newCard = await prisma.card.create({
      data: {
        deckId: newDeck.id,
        front: card.front,
        back: card.back,
        cardType: card.cardType,
        mediaUrls: card.mediaUrls,
      },
    });

    for (const cardTag of card.cardTags) {
      let tag = await prisma.tag.findFirst({
        where: { userId, name: cardTag.tag.name },
      });
      
      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            userId,
            name: cardTag.tag.name,
            color: cardTag.tag.color,
          },
        });
      }

      await prisma.cardTag.create({
        data: {
          cardId: newCard.id,
          tagId: tag.id,
          userId,
        },
      });
    }
  }

  return newDeck;
}

export async function importDeckByCode(inviteCode: string, userId: string) {
  const sourceDeck = await prisma.deck.findFirst({
    where: { inviteCode },
    include: {
      cards: {
        include: {
          cardTags: { include: { tag: true } },
        },
      },
    },
  });

  if (!sourceDeck) {
    throw new Error('邀请码无效或卡片组已取消分享');
  }

  const newDeck = await prisma.deck.create({
    data: {
      userId,
      name: `${sourceDeck.name} (导入)`,
      description: sourceDeck.description,
    },
  });

  for (const card of sourceDeck.cards) {
    const newCard = await prisma.card.create({
      data: {
        deckId: newDeck.id,
        front: card.front,
        back: card.back,
        cardType: card.cardType,
        mediaUrls: card.mediaUrls,
      },
    });

    for (const cardTag of card.cardTags) {
      let tag = await prisma.tag.findFirst({
        where: { userId, name: cardTag.tag.name },
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            userId,
            name: cardTag.tag.name,
            color: cardTag.tag.color,
            isPreset: false,
          },
        });
      }

      await prisma.cardTag.create({
        data: {
          cardId: newCard.id,
          tagId: tag.id,
          userId,
        },
      });
    }
  }

  return newDeck;
}

export async function getPublicDecks(filters?: {
  sortBy?: 'latest' | 'popular';
  category?: string;
  search?: string;
}) {
  const whereClause: any = { isPublic: true };

  let orderByClause: any = { createdAt: 'desc' };

  if (filters?.sortBy === 'popular') {
    orderByClause = { cards: { _count: 'desc' } };
  }

  const decks = await prisma.deck.findMany({
    where: whereClause,
    include: {
      user: {
        select: { id: true, nickname: true, avatar: true },
      },
      _count: {
        select: { cards: true },
      },
    },
    orderBy: orderByClause,
    take: 50,
  });

  if (filters?.search) {
    return decks.filter(deck =>
      deck.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
      deck.description?.toLowerCase().includes(filters.search!.toLowerCase())
    );
  }

  return decks;
}
