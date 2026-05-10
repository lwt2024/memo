import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

function randomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

async function generateMockData() {
  console.log('开始生成模拟数据...\n');

  // 清除旧数据
  await prisma.cardTag.deleteMany();
  await prisma.reviewRecord.deleteMany();
  await prisma.card.deleteMany();
  await prisma.deck.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  已清除旧数据\n');

  // 1. 创建用户（30天前注册）
  const userId = crypto.randomUUID();
  const createdAt = randomDate(30);
  const passwordHash = await bcrypt.hash('demo123', 10);

  await prisma.user.create({
    data: {
      id: userId,
      username: 'demo_user',
      email: 'demo@example.com',
      passwordHash: passwordHash,
      nickname: '记忆达人',
      avatar: null,
      createdAt: createdAt,
    },
  });
  console.log('✅ 用户创建成功: demo_user / demo123\n');

  // 2. 创建标签
  const tagData = [
    { name: '重要', color: '#ef4444' },
    { name: '考研', color: '#3b82f6' },
    { name: '英语', color: '#10b981' },
    { name: '编程', color: '#8b5cf6' },
    { name: '心理学', color: '#f59e0b' },
  ];

  const tags = [];
  for (const t of tagData) {
    const tag = await prisma.tag.create({
      data: { ...t, userId },
    });
    tags.push(tag);
  }
  console.log(`✅ 创建了 ${tags.length} 个标签\n`);

  // 3. 创建卡片组和卡片
  const decksData = [
    {
      name: '考研政治 - 马克思主义基本原理',
      description: '包含唯物论、辩证法、认识论等核心概念',
      cardCount: 25,
      isPublic: true,
      tagIndex: [1],
    },
    {
      name: '英语四级核心词汇',
      description: '高频词汇速记，附例句和搭配',
      cardCount: 50,
      isPublic: true,
      tagIndex: [2],
    },
    {
      name: '数据结构与算法',
      description: '常用数据结构原理和算法实现',
      cardCount: 30,
      isPublic: false,
      tagIndex: [3],
    },
    {
      name: '心理学基础知识',
      description: '普通心理学重点概念汇总',
      cardCount: 20,
      isPublic: true,
      tagIndex: [4],
    },
    {
      name: 'React Hooks 最佳实践',
      description: 'useState、useEffect、useCallback 等用法总结',
      cardCount: 15,
      isPublic: false,
      tagIndex: [3],
    },
  ];

  let totalCards = 0;
  let shuffledTags = [...tags];

  for (const deckInfo of decksData) {
    const deck = await prisma.deck.create({
      data: {
        userId,
        name: deckInfo.name,
        description: deckInfo.description,
        isPublic: deckInfo.isPublic,
        createdAt: randomDate(25 + Math.floor(Math.random() * 10)),
      },
    });

    console.log(`📚 正在创建卡片组 "${deckInfo.name}"...`);

    for (let i = 0; i < deckInfo.cardCount; i++) {
      const card = await prisma.card.create({
        data: {
          deckId: deck.id,
          front: getRandomQuestion(deckInfo.name),
          back: getRandomAnswer(deckInfo.name),
          cardType: 'text',
          createdAt: randomDate(20 + Math.floor(Math.random() * 15)),
        },
      });

      // 添加标签
      for (const tagIdx of deckInfo.tagIndex) {
        await prisma.cardTag.create({
          data: {
            cardId: card.id,
            tagId: tags[tagIdx].id,
            userId,
          },
        });
      }

      // 随机添加1-2个额外标签
      const extraTagCount = Math.floor(Math.random() * 2);
      if (extraTagCount > 0) {
        shuffledTags = shuffledTags.filter(t => !deckInfo.tagIndex.includes(tags.indexOf(t))).sort(() => Math.random() - 0.5);
        for (let t = 0; t < extraTagCount && t < shuffledTags.length; t++) {
          try {
            await prisma.cardTag.create({
              data: {
                cardId: card.id,
                tagId: shuffledTags[t].id,
                userId,
              },
            });
          } catch (e) {
            // 忽略重复标签错误
          }
        }
      }

      // 模拟复习历史：随机复习5-25次
      const reviewCount = Math.floor(Math.random() * 21) + 5;
      const masteryLevel = Math.min(Math.floor(reviewCount / 5), 5);
      const lastReviewAt = randomDate(Math.floor(Math.random() * 28) + 1);
      
      // 根据复习次数计算下次复习时间
      const baseInterval = Math.pow(2, Math.min(reviewCount, 6));
      const nextReviewAt = new Date(lastReviewAt);
      nextReviewAt.setDate(nextReviewAt.getDate() + baseInterval);

      // 30% 的卡片设置为已到期待复习状态
      const isDueForReview = Math.random() < 0.3;
      if (isDueForReview) {
        // 设置为1-7天前到期
        const daysOverdue = Math.floor(Math.random() * 7) + 1;
        nextReviewAt.setDate(nextReviewAt.getDate() - baseInterval - daysOverdue);
      }

      await prisma.reviewRecord.create({
        data: {
          cardId: card.id,
          userId,
          easeLevel: Math.min(3 + Math.floor(masteryLevel / 2), 5),
          nextReviewAt: nextReviewAt,
          lastReviewAt: lastReviewAt,
          reviewCount: reviewCount,
          masteryLevel: masteryLevel,
        },
      });

      totalCards++;
    }

    console.log(`   ✅ 完成 ${deckInfo.cardCount} 张卡片\n`);
  }

  console.log('========================================');
  console.log('🎉 模拟数据生成完成！');
  console.log('========================================');
  console.log(`👤 用户: demo_user`);
  console.log(`🔐 密码: demo123`);
  console.log(`📚 卡片组: ${decksData.length} 个`);
  console.log(`📝 卡片总数: ${totalCards} 张`);
  console.log(`🏷️  标签: ${tags.length} 个`);
  console.log('========================================');
  console.log('\n💡 提示：登录后可以在 Dashboard 查看统计数据');
  console.log('   部分卡片已到期复习，部分卡片已掌握');
}

function getRandomQuestion(deckName) {
  const questions = {
    '考研政治': [
      '什么是矛盾的普遍性和特殊性？',
      '唯物辩证法的基本规律有哪些？',
      '实践与认识的辩证关系是什么？',
      '社会存在与社会意识的关系如何？',
      '价值的本质是什么？',
      '商品的二因素与生产商品的劳动二重性？',
      '资本循环的条件是什么？',
      '认识的本质是什么？',
      '真理的绝对性和相对性关系？',
      '社会基本矛盾是什么？',
    ],
    '英语四级': [
      'abandon 的用法是什么？',
      'accomplish 和 achieve 有什么区别？',
      'benefit from 的同义表达有哪些？',
      'crucial 和 critical 的区别？',
      'debate 和 discussion 的语义差异？',
      'economy 和 economics 的区别？',
      'efficient 和 effective 的用法差异？',
      'implement 和 enforcement 的区别？',
      'fundamental 和 basic 语义差异？',
      '海量的同义词有哪些？',
    ],
    '数据结构': [
      '栈和队列的区别是什么？',
      '二叉树的遍历方式有哪些？',
      '什么是哈希表的冲突解决？',
      '快速排序的时间复杂度？',
      '什么是图的深度优先搜索？',
      '堆和栈的区别是什么？',
      '什么是最小生成树？',
      'B树和B+树的区别？',
      '什么是动态规划？',
      '二叉搜索树的特点是什么？',
    ],
    '心理学': [
      '什么是认知失调理论？',
      '马斯洛需求层次理论的内容？',
      '记忆的三个阶段是什么？',
      '什么是条件反射？',
      '皮亚杰认知发展四阶段？',
      '从众和服从的区别是什么？',
      '什么是归因理论？',
      '自我效能感是什么？',
      '应激反应的定义？',
      '依恋类型的分类？',
    ],
    'React': [
      'useState 的正确用法？',
      'useEffect 的依赖数组怎么写？',
      'useCallback 和 useMemo 的区别？',
      '什么是 React 的虚拟 DOM？',
      'Context API 的使用场景？',
      'React Fiber 架构的核心思想？',
      'useRef 和 useState 的区别？',
      '什么是 React 的调和算法？',
      'useMemo 和 useCallback 的性能优化？',
      'React.memo 的作用是什么？',
    ],
  };

  for (const [key, qs] of Object.entries(questions)) {
    if (deckName.includes(key)) {
      return qs[Math.floor(Math.random() * qs.length)];
    }
  }
  return '这是一个重要的知识点，需要认真学习掌握';
}

function getRandomAnswer(deckName) {
  if (deckName.includes('考研政治')) {
    return '这是考研政治的重要概念，需要结合教材和时事进行深入理解。建议查阅相关经典著作加深认识。';
  }
  if (deckName.includes('英语')) {
    return '这是四级考试的高频词汇，建议结合例句记忆，多练习搭配短语效果更好。';
  }
  if (deckName.includes('数据结构') || deckName.includes('算法')) {
    return '这是计算机科学的基础知识，需要通过代码实现加深理解，建议配合 LeetCode 练习。';
  }
  if (deckName.includes('心理学')) {
    return '这是心理学的重要理论，对理解人类行为有重要意义，生活中可以多观察验证。';
  }
  if (deckName.includes('React')) {
    return '这是 React 开发中的常用技巧，实际项目中要灵活运用，注意性能优化。';
  }
  return '这是需要掌握的重要知识点，建议多加练习。';
}

generateMockData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
