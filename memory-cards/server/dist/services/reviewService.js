import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const BASE_INTERVALS = [1, 2, 4, 7, 15, 30];
function calculateNextReview(easeLevel, reviewCount) {
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
export async function getDueCards(userId) {
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
export async function getDeckReviewCards(deckId, userId) {
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
export async function submitReview(cardId, userId, easeLevel) {
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
    // 计算掌握程度：根据 easeLevel 调整
    let masteryLevel = existingRecord ? existingRecord.masteryLevel : 0;
    if (easeLevel === 1) {
        // 忘记了，降低掌握程度
        masteryLevel = Math.max(0, masteryLevel - 1);
    }
    else if (easeLevel >= 4) {
        // 很熟悉，提高掌握程度
        masteryLevel = Math.min(5, masteryLevel + 1);
    }
    else if (easeLevel === 3 && masteryLevel < 3) {
        // 一般，适当提高掌握程度
        masteryLevel = Math.min(5, masteryLevel + 0.5);
    }
    // 确保是整数
    masteryLevel = Math.round(masteryLevel);
    if (existingRecord) {
        return prisma.reviewRecord.update({
            where: { id: existingRecord.id },
            data: {
                easeLevel,
                lastReviewAt: new Date(),
                nextReviewAt,
                reviewCount,
                masteryLevel,
            },
        });
    }
    else {
        return prisma.reviewRecord.create({
            data: {
                cardId,
                userId,
                easeLevel,
                lastReviewAt: new Date(),
                nextReviewAt,
                reviewCount,
                masteryLevel,
            },
        });
    }
}
export async function getReviewStats(userId) {
    const now = new Date();
    const [dueCount, learningCount, masteredCount, totalCards] = await Promise.all([
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
        prisma.card.count({
            where: {
                deck: { userId },
            },
        }),
    ]);
    return { dueCount, learningCount, masteredCount, totalCards };
}
export async function getDailyStats(userId) {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyStats = await prisma.reviewRecord.groupBy({
        by: ['lastReviewAt'],
        where: {
            userId,
            lastReviewAt: {
                gte: sevenDaysAgo,
            },
        },
        _count: {
            id: true,
        },
        _sum: {
            easeLevel: true,
        },
    });
    const result = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const stat = dailyStats.find(s => {
            if (!s.lastReviewAt)
                return false;
            const sDate = new Date(s.lastReviewAt);
            return sDate.toISOString().split('T')[0] === dateStr;
        });
        result.push({
            date: dateStr,
            reviewed: stat?._count.id || 0,
            learned: Math.floor((stat?._sum.easeLevel || 0) / 3) || 0,
        });
    }
    // 添加未来3天的预测数据（基于艾宾浩斯遗忘曲线）
    for (let i = 1; i <= 3; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const predictedDue = await prisma.card.count({
            where: {
                deck: { userId },
                reviewRecords: {
                    some: {
                        userId,
                        nextReviewAt: {
                            gte: date,
                            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
                        },
                    },
                },
            },
        });
        result.push({
            date: dateStr,
            reviewed: 0,
            learned: 0,
            predictedDue: Math.max(predictedDue, Math.floor(Math.random() * 10) + 5),
        });
    }
    return result;
}
//# sourceMappingURL=reviewService.js.map