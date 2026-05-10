import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function createCard(deckId, userId, front, back, cardType = 'text', mediaUrls) {
    const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
    if (!deck) {
        throw new Error('卡片组不存在');
    }
    return prisma.card.create({
        data: { deckId, front, back, cardType, mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null },
    });
}
export async function getDeckCards(deckId, userId) {
    const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
    if (!deck) {
        throw new Error('卡片组不存在');
    }
    return prisma.card.findMany({
        where: { deckId },
        orderBy: { createdAt: 'asc' },
    });
}
export async function updateCard(cardId, userId, data) {
    const card = await prisma.card.findFirst({
        where: { id: cardId },
        include: { deck: true },
    });
    if (!card || card.deck.userId !== userId) {
        throw new Error('卡片不存在');
    }
    const updateData = {
        front: data.front,
        back: data.back,
        cardType: data.cardType,
        mediaUrls: data.mediaUrls ? JSON.stringify(data.mediaUrls) : null,
    };
    return prisma.card.update({
        where: { id: cardId },
        data: updateData,
    });
}
export async function deleteCard(cardId, userId) {
    const card = await prisma.card.findFirst({
        where: { id: cardId },
        include: { deck: true },
    });
    if (!card || card.deck.userId !== userId) {
        throw new Error('卡片不存在');
    }
    return prisma.card.delete({ where: { id: cardId } });
}
//# sourceMappingURL=cardService.js.map