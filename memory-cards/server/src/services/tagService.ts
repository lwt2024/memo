import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRESET_TAGS = [
  { name: '重要', color: '#ef4444' },
  { name: '待复习', color: '#f97316' },
  { name: '重点', color: '#3b82f6' },
  { name: '易错', color: '#8b5cf6' },
  { name: '已掌握', color: '#22c55e' },
  { name: '拓展', color: '#06b6d4' },
  { name: '基础', color: '#eab308' },
  { name: '进阶', color: '#ec4899' },
];

export async function ensurePresetTags(userId: string) {
  const existingTags = await prisma.tag.findMany({
    where: { userId, isPreset: true },
  });

  const existingNames = new Set(existingTags.map(t => t.name));

  const tagsToCreate = PRESET_TAGS.filter(tag => !existingNames.has(tag.name)).map(tag => ({
    ...tag,
    userId,
    isPreset: true,
  }));

  if (tagsToCreate.length > 0) {
    await prisma.tag.createMany({
      data: tagsToCreate,
    });
  }
}

export async function getUserTags(userId: string) {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: [
      { isPreset: 'desc' },
      { createdAt: 'asc' },
    ],
  });
}

export async function createTag(userId: string, name: string, color: string) {
  if (name.length < 2 || name.length > 20) {
    throw new Error('标签名称长度必须在2-20个字符之间');
  }

  const existingTag = await prisma.tag.findUnique({
    where: {
      userId_name: { userId, name },
    },
  });

  if (existingTag) {
    throw new Error('标签名称已存在');
  }

  return prisma.tag.create({
    data: {
      name,
      color,
      userId,
    },
  });
}

export async function getDeckTags(deckId: string) {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      cards: {
        include: {
          cardTags: {
            include: { tag: true },
          },
        },
      },
    },
  });

  if (!deck) {
    return [];
  }

  const tagCountMap = new Map<string, { tag: any, count: number }>();

  deck.cards.forEach(card => {
    card.cardTags.forEach(cardTag => {
      const existing = tagCountMap.get(cardTag.tagId);
      if (existing) {
        existing.count++;
      } else {
        tagCountMap.set(cardTag.tagId, { tag: cardTag.tag, count: 1 });
      }
    });
  });

  return Array.from(tagCountMap.values()).map(({ tag, count }) => ({
    ...tag,
    cardCount: count,
  }));
}

export async function addTagToCard(cardId: string, tagId: string, userId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { deck: true },
  });

  if (!card || card.deck.userId !== userId) {
    throw new Error('无权操作权限不足');
  }

  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  });

  if (!tag || tag.userId !== userId) {
    throw new Error('标签不存在或无权使用');
  }

  const currentTagsCount = await prisma.cardTag.count({
    where: { cardId, userId },
  });

  if (currentTagsCount >= 3) {
    throw new Error('一张卡片最多只能添加3个标签');
  }

  return prisma.cardTag.create({
    data: {
      cardId,
      tagId,
      userId,
    },
  });
}

export async function removeTagFromCard(cardId: string, tagId: string, userId: string) {
  const cardTag = await prisma.cardTag.findUnique({
    where: {
      cardId_tagId: { cardId, tagId },
    },
  });

  if (!cardTag || cardTag.userId !== userId) {
    throw new Error('无权操作');
  }

  return prisma.cardTag.delete({
    where: {
      cardId_tagId: { cardId, tagId },
    },
  });
}

export async function deleteTag(tagId: string, userId: string) {
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
  });

  if (!tag) {
    throw new Error('标签不存在');
  }

  if (tag.userId !== userId) {
    throw new Error('无权删除该标签');
  }

  if (tag.isPreset) {
    throw new Error('预设标签不能删除');
  }

  return prisma.tag.delete({
    where: { id: tagId },
  });
}
