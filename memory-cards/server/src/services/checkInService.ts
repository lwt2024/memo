import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function checkIn(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existingCheckIn = await prisma.checkIn.findFirst({
    where: {
      userId,
      checkInAt: {
        gte: today,
      },
    },
  });
  
  if (existingCheckIn) {
    throw new Error('今日已签到');
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const yesterdayCheckIn = await prisma.checkIn.findFirst({
    where: {
      userId,
      checkInAt: {
        gte: yesterday,
        lt: today,
      },
    },
  });
  
  const streakDays = yesterdayCheckIn ? await getCurrentStreak(userId) + 1 : 1;
  const bonusPoints = streakDays > 1 ? Math.min(streakDays - 1, 5) * 5 : 0;
  const totalPoints = 10 + bonusPoints;
  
  await prisma.$transaction([
    prisma.checkIn.create({
      data: {
        userId,
        points: totalPoints,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: totalPoints,
        },
      },
    }),
  ]);
  
  return {
    success: true,
    points: totalPoints,
    streakDays,
    message: bonusPoints > 0 
      ? `签到成功！获得 ${totalPoints} 积分（连续签到奖励 +${bonusPoints}）`
      : '签到成功！获得 10 积分',
  };
}

export async function getCurrentStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let checkDate = new Date(today);
  
  for (let i = 0; i < 365; i++) {
    const nextDate = new Date(checkDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const checkIn = await prisma.checkIn.findFirst({
      where: {
        userId,
        checkInAt: {
          gte: checkDate,
          lt: nextDate,
        },
      },
    });
    
    if (checkIn) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export async function getUserStats(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: { totalPoints: true },
  });
  
  const streak = await getCurrentStreak(userId);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextDay = new Date(today);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const todayCheckIn = await prisma.checkIn.findFirst({
    where: {
      userId,
      checkInAt: { 
        gte: today,
        lt: nextDay,
      },
    },
  });
  
  return {
    totalPoints: user?.totalPoints || 0,
    streakDays: streak,
    checkedInToday: !!todayCheckIn,
  };
}

export interface CalendarDay {
  date: string;
  points: number;
  newCards: number;
  reviewedCards: number;
}

export async function getCheckInCalendar(userId: string, months: number = 6) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(today);
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setHours(0, 0, 0, 0);
  
  const checkIns = await prisma.checkIn.findMany({
    where: {
      userId,
      checkInAt: {
        gte: startDate,
      },
    },
    orderBy: {
      checkInAt: 'asc',
    },
  });
  
  const reviews = await prisma.reviewRecord.findMany({
    where: {
      userId,
      lastReviewAt: {
        gte: startDate,
      },
    },
    orderBy: {
      lastReviewAt: 'asc',
    },
  });
  
  const cards = await prisma.card.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  
  const calendar: CalendarDay[] = [];
  const checkInMap = new Map<string, number>();
  const reviewMap = new Map<string, number>();
  const cardMap = new Map<string, number>();
  
  checkIns.forEach((checkIn) => {
    const date = new Date(checkIn.checkInAt);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];
    checkInMap.set(dateStr, checkIn.points);
  });
  
  reviews.forEach((review) => {
    const date = new Date(review.lastReviewAt || review.createdAt);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];
    reviewMap.set(dateStr, (reviewMap.get(dateStr) || 0) + 1);
  });
  
  cards.forEach((card) => {
    const date = new Date(card.createdAt);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];
    cardMap.set(dateStr, (cardMap.get(dateStr) || 0) + 1);
  });
  
  for (let i = 0; i <= months * 31; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    if (date > today) break;
    
    const dateStr = date.toISOString().split('T')[0];
    calendar.push({
      date: dateStr,
      points: checkInMap.get(dateStr) || 0,
      newCards: cardMap.get(dateStr) || 0,
      reviewedCards: reviewMap.get(dateStr) || 0,
    });
  }
  
  return calendar;
}