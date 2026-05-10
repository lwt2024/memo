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

  await prisma.cardTag.deleteMany();
  await prisma.reviewRecord.deleteMany();
  await prisma.card.deleteMany();
  await prisma.deck.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  已清除旧数据\n');

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

  const otherUsersData = [
    {
      username: 'wang_user',
      email: 'wang@example.com',
      nickname: '英语达人小王',
      decks: [
        { name: '雅思核心词汇精选', description: '雅思考试高频词汇 2000 词', cardCount: 30 },
        { name: '托福学术词汇', description: '托福阅读必备学术词汇表', cardCount: 25 },
      ]
    },
    {
      username: 'coder_user',
      email: 'coder@example.com',
      nickname: '代码狂人',
      decks: [
        { name: 'Python 数据分析入门', description: 'NumPy、Pandas 基础概念速记', cardCount: 20 },
        { name: 'JavaScript 高级技巧', description: 'ES6+ 核心概念与应用', cardCount: 25 },
      ]
    },
    {
      username: 'med_user',
      email: 'med@example.com',
      nickname: '医学生小林',
      decks: [
        { name: '解剖学重点速记', description: '人体主要骨骼与肌肉系统', cardCount: 30 },
        { name: '药理学核心知识点', description: '常用药物分类与作用机制', cardCount: 20 },
      ]
    }
  ];

  for (const userData of otherUsersData) {
    const otherUserId = crypto.randomUUID();
    const otherUserHash = await bcrypt.hash('pass123', 10);
    await prisma.user.create({
      data: {
        id: otherUserId,
        username: userData.username,
        email: userData.email,
        passwordHash: otherUserHash,
        nickname: userData.nickname,
        avatar: null,
        createdAt: randomDate(60),
      },
    });
    console.log(`✅ 其他用户创建: ${userData.nickname}`);

    for (const deckInfo of userData.decks) {
      const deck = await prisma.deck.create({
        data: {
          userId: otherUserId,
          name: deckInfo.name,
          description: deckInfo.description,
          isPublic: true,
          createdAt: randomDate(40 + Math.floor(Math.random() * 20)),
        },
      });

      for (let i = 0; i < deckInfo.cardCount; i++) {
        const qa = getQAForOtherDeck(deckInfo.name);
        await prisma.card.create({
          data: {
            deckId: deck.id,
            front: qa.front,
            back: qa.back,
            cardType: 'text',
            createdAt: randomDate(30 + Math.floor(Math.random() * 20)),
          },
        });
      }
      console.log(`   ✅ 卡片组 "${deckInfo.name}" 已创建 ${deckInfo.cardCount} 张卡片`);
    }
  }

  console.log('');

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
      const qa = getQAForDeck(deckInfo.name);
      const card = await prisma.card.create({
        data: {
          deckId: deck.id,
          front: qa.front,
          back: qa.back,
          cardType: 'text',
          createdAt: randomDate(Math.floor(Math.random() * 25)),
        },
      });

      for (const tagIdx of deckInfo.tagIndex) {
        await prisma.cardTag.create({
          data: {
            cardId: card.id,
            tagId: tags[tagIdx].id,
            userId,
          },
        });
      }

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
          }
        }
      }

      const reviewCount = Math.floor(Math.random() * 11) + 3;
      const masteryLevel = Math.min(Math.floor(reviewCount / 3), 5);
      
      const daysAgo = Math.floor(Math.random() * 7);
      const lastReviewAt = randomDate(daysAgo);
      
      const baseInterval = Math.pow(2, Math.min(reviewCount, 6));
      const nextReviewAt = new Date(lastReviewAt);
      nextReviewAt.setDate(nextReviewAt.getDate() + baseInterval);

      const isDueForReview = Math.random() < 0.3;
      if (isDueForReview) {
        const daysOverdue = Math.floor(Math.random() * 7) + 1;
        nextReviewAt.setDate(nextReviewAt.getDate() - baseInterval - daysOverdue);
      }

      await prisma.reviewRecord.create({
        data: {
          cardId: card.id,
          userId,
          easeLevel: Math.min(2 + Math.floor(reviewCount / 2), 5),
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
  console.log(`👤 主用户: demo_user / demo123`);
  console.log(`👤 其他用户: wang_user / pass123 (英语达人小王)`);
  console.log(`👤 其他用户: coder_user / pass123 (代码狂人)`);
  console.log(`👤 其他用户: med_user / pass123 (医学生小林)`);
  console.log(`📚 卡片组总数: ${decksData.length + otherUsersData.reduce((sum, u) => sum + u.decks.length, 0)} 个`);
  console.log(`📝 卡片总数: ${totalCards + otherUsersData.reduce((sum, u) => sum + u.decks.reduce((s, d) => s + d.cardCount, 0), 0)} 张`);
  console.log('========================================');
}

function getQAForDeck(deckName) {
  const qaPairs = {
    '考研政治': [
      { q: '什么是矛盾的普遍性和特殊性？', a: '矛盾的普遍性指矛盾存在于一切事物的发展过程中，每一事物的发展过程中都存在着自始至终的矛盾运动。矛盾的特殊性指不同事物的矛盾具有不同的特点，同一事物的矛盾在不同发展阶段各有不同的特点。两者是共性与个性、一般与个别的关系。' },
      { q: '唯物辩证法的基本规律有哪些？', a: '唯物辩证法的三大基本规律是：对立统一规律（矛盾规律）、质量互变规律、否定之否定规律。对立统一规律揭示了事物发展的动力和源泉，质量互变规律揭示了事物发展的形式和状态，否定之否定规律揭示了事物发展的方向和道路。' },
      { q: '实践与认识的辩证关系是什么？', a: '实践是认识的基础，实践决定认识：实践是认识的来源，是认识发展的动力，是检验认识真理性的唯一标准，是认识的目的。认识对实践具有反作用：正确的认识指导实践取得成功，错误的认识会导致实践失败。' },
      { q: '社会存在与社会意识的关系如何？', a: '社会存在决定社会意识，社会意识的能动作用以及社会意识的相对独立性。社会存在包括物质资料的生产方式、地理环境和人口因素。社会意识包括政治法律思想、道德、艺术、哲学、宗教等。' },
      { q: '价值的本质是什么？', a: '价值是凝结在商品中的无差别的人类劳动，即抽象劳动。价值是商品特有的属性，反映了商品生产者之间的社会经济关系。价值是价格的基础，价格是价值的货币表现形式。' },
      { q: '商品的二因素与生产商品的劳动二重性？', a: '商品二因素是使用价值和价值。生产商品的劳动二重性是具体劳动和抽象劳动。具体劳动创造使用价值，抽象劳动创造价值。劳动二重性学说是理解政治经济学的枢纽。' },
      { q: '资本循环的条件是什么？', a: '产业资本循环必须具备两个条件：第一，资本的三种职能形式在空间上同时并存，即货币资本、生产资本、商品资本同时存在；第二，资本的三种职能形式在时间上依次转化，即三种循环形式在时间上相继进行。' },
      { q: '认识的本质是什么？', a: '认识的本质是主体对客体的能动反映。认识的能动反映具有创造性，它不是对客体的简单摹写，而是对客体的选择、建构和创新。实践是认识的来源、动力、目的和检验标准。' },
      { q: '真理的绝对性和相对性关系？', a: '真理的绝对性是指任何真理都是对客观事物及其规律的正确反映，都有客观内容。真理的相对性是指任何真理都是对整个世界某一领域、某一过程的正确反映。两者是辩证统一的关系，绝对真理寓于相对真理之中。' },
      { q: '社会基本矛盾是什么？', a: '社会基本矛盾是生产力和生产关系、经济基础和上层建筑之间的矛盾。这两对矛盾存在于一切社会形态之中，贯穿于每一社会形态的始终，决定着其他各种社会矛盾的存在和发展。' },
    ],
    '英语四级': [
      { q: 'abandon 的用法是什么？', a: 'abandon 表示放弃、遗弃，常用结构：abandon sth/sb 或 abandon doing sth。例如：He abandoned his car on the highway.（他把车丢在了高速公路上。）其名词形式为 abandonment。' },
      { q: 'accomplish 和 achieve 有什么区别？', a: 'accomplish 强调完成某项任务或达到目的，常与 goal、task 连用。achieve 强调通过努力获得成就或成功，更强调结果和成就。常搭配：accomplish a task/goal, achieve success/victory。' },
      { q: 'benefit from 的同义表达有哪些？', a: 'benefit from 的同义表达包括：profit from（从...中获益）、gain from、draw advantage from、be helped by。例如：Students can benefit greatly from this program. = Students can profit greatly from this program.' },
      { q: 'crucial 和 critical 的区别？', a: 'crucial 强调至关重要、决定性的，常用于描述关键转折点。critical 除表示关键外，还有批判的、评论的、危险的含义。两者在表示"关键的"时可互换，但 critical 更强调危急时刻。' },
      { q: 'debate 和 discussion 的语义差异？', a: 'debate 通常指正式的、公开的辩论，有正反双方对抗的性质。discussion 通常指非正式的、商讨性的讨论。debate 强调输赢，discussion 强调交流观点。例如：a presidential debate（总统辩论）vs team discussion（团队讨论）。' },
      { q: 'economy 和 economics 的区别？', a: 'economy 是名词，表示经济、经济体制，如 market economy（市场经济）。economics 是名词，表示经济学，如 He studies economics（他学经济学）。注意：economics 视为单数或复数皆可。' },
      { q: 'efficient 和 effective 的用法差异？', a: 'efficient 强调效率高、省力的，指用最少的资源完成任务。effective 强调有效、达到预期效果的，指能产生预期结果。例如：an efficient secretary（效率高的秘书）vs effective advertising（有效的广告）。' },
      { q: 'implement 和 enforcement 的区别？', a: 'implement 是动词或名词，表示实施、执行、实现，如 implement policies（实施政策）。enforcement 是名词，表示强制执行、执法，如 law enforcement（执法）。注意拼写差异！' },
      { q: 'fundamental 和 basic 语义差异？', a: 'fundamental 强调基础的、根本的，常用于抽象的、重要的原则或理论。basic 强调基本的、初步的，可用于具体或抽象事物。fundamental 比 basic 语气更强，更正式。例如：fundamental principles（根本原则）vs basic skills（基本技能）。' },
      { q: '"海量"的同义词有哪些？', a: '"海量"的英文表达包括：massive（大量的）、vast（广阔的）、enormous（巨大的）、immense（广大的）、tremendous（极大的）、a large amount of、a huge number of。选择取决于语境和正式程度。' },
    ],
    '数据结构': [
      { q: '栈和队列的区别是什么？', a: '栈（Stack）是后进先出（LIFO）的数据结构，只允许在栈顶进行插入和删除操作。队列（Queue）是先进先出（FIFO）的数据结构，允许在队尾插入、队头删除。栈常用表达式求值、函数调用，队列常用于任务调度、缓冲区。' },
      { q: '二叉树的遍历方式有哪些？', a: '二叉树有四种遍历方式：1.前序遍历（根-左-右）2.中序遍历（左-根-右）3.后序遍历（左-右-根）4.层序遍历（按层次）。前中后序属于深度优先遍历，层序遍历属于广度优先遍历。' },
      { q: '什么是哈希表的冲突解决？', a: '哈希表冲突解决方法主要有：1.开放地址法（线性探测、二次探测、双重散列）2.链地址法（将冲突元素用链表连接）3.再哈希法（用另一个哈希函数再散列）。选择合适的方法可以提高查找效率。' },
      { q: '快速排序的时间复杂度？', a: '快速排序平均时间复杂度为 O(n log n)，最坏情况为 O(n²)。快速排序是原地排序，空间复杂度为 O(log n)。其性能取决于 pivot（基准）的选择。随机化选择 pivot 可以避免最坏情况。' },
      { q: '什么是图的深度优先搜索？', a: '深度优先搜索（DFS）是一种遍历图的算法，沿着一条路径尽可能深入，然后回溯。实现方式：使用栈或递归。从起点开始，标记已访问，依次访问未被访问的邻接点，直到所有可达顶点都被访问。' },
      { q: '堆和栈的区别是什么？', a: '堆（Heap）是一种完全二叉树，常用数组实现，用于动态内存分配和优先队列。栈（Stack）是后进先出结构，用于函数调用、局部变量存储。堆内存由程序员管理，栈内存由系统自动管理。' },
      { q: '什么是最小生成树？', a: '最小生成树（MST）是图中连接所有顶点且边权值之和最小的树。常用算法有：Prim 算法（从点出发）和 Kruskal 算法（从边出发）。MST 应用于网络设计、道路规划等场景。' },
      { q: 'B树和B+树的区别？', a: 'B树的每个节点都存储数据，所有节点都包含索引。B+树只有叶子节点存储数据，内部节点仅存储索引。B+树的查询更稳定（都要到叶子），更适合范围查询，文件系统数据库索引常用 B+树。' },
      { q: '什么是动态规划？', a: '动态规划（DP）是一种算法思想，将复杂问题分解为子问题，通过保存子问题的解避免重复计算。适用条件：最优子结构、无后效性、重叠子问题。经典应用：斐波那契数列、背包问题、最长公共子序列。' },
      { q: '二叉搜索树的特点是什么？', a: '二叉搜索树（BST）的特点是：左子树所有节点值小于根节点，右子树所有节点值大于根节点，左右子树也是二叉搜索树。BST 支持 O(log n) 的查找、插入、删除操作，但退化成链表时复杂度为 O(n)。' },
    ],
    '心理学': [
      { q: '什么是认知失调理论？', a: '认知失调理论由费斯廷格提出，指当个体持有的两个或多个认知元素不一致时，会产生心理上的不适感。人们会通过改变态度、改变行为或添加新认知来减少这种失调，以恢复心理平衡。' },
      { q: '马斯洛需求层次理论的内容？', a: '马斯洛需求层次理论将人类需求分为五层（后扩展为七层）：生理需求、安全需求、社交需求、尊重需求、自我实现需求。较低层次需求满足后，才会追求较高层次需求。' },
      { q: '记忆的三个阶段是什么？', a: '记忆的三个阶段是：1.编码阶段（信息进入感觉记忆并被加工）2.存储阶段（信息在短时记忆或长时记忆中保持）3.提取阶段（从记忆中检索信息）。良好的记忆需要有效的编码和定期复习。' },
      { q: '什么是条件反射？', a: '条件反射是巴甫洛夫提出的学习方式。经典条件反射：将无关刺激与无条件刺激配对，使原本无关的刺激也能引发反应（如狗听到铃声分泌唾液）。操作性条件反射：行为结果影响行为再次出现的概率。' },
      { q: '皮亚杰认知发展四阶段？', a: '皮亚杰将认知发展分为四个阶段：1.感觉运动阶段（0-2岁）2.前运算阶段（2-7岁）3.具体运算阶段（7-11岁）4.形式运算阶段（11岁以后）。每个阶段都有其独特的思维特点。' },
      { q: '从众和服从的区别是什么？', a: '从众是受群体压力影响而改变行为或信念，但内心可能保留不同意见。服从是听从权威或上级的命令，通常出于法律、规范或利益考虑。经典的从众实验是阿希线段实验，服从实验是米尔格拉姆电击实验。' },
      { q: '什么是归因理论？', a: '归因理论解释人们如何解释他人和自己行为的原因。海德的归因理论分为内归因（能力、努力）和外归因（任务难度、运气）。韦纳的归因理论进一步分析了归因对动机的影响，强调可控性因素的作用。' },
      { q: '自我效能感是什么？', a: '自我效能感由班杜拉提出，指个体对自己能否成功完成某项任务的信心和判断。高自我效能感有助于设定更高目标、坚持面对困难、更好地应对压力。可通过成功经验、替代经验、言语鼓励等方式提高。' },
      { q: '应激反应的定义？', a: '应激是个体对威胁性或挑战性情境产生的生理和心理反应。应激反应包括：1.生理反应（交感神经激活、激素分泌）2.情绪反应（焦虑、恐惧）3.行为反应（战斗、逃跑或冻结）。适度应激有助于表现，过度应激有害健康。' },
      { q: '依恋类型的分类？', a: '成人依恋类型分为四类：安全型（对亲密感到舒适）、焦虑-矛盾型（担心被抛弃）、回避型（对亲密感到不适）、混乱型（同时表现出焦虑和回避）。依恋类型形成于婴幼儿期，影响成年后人际关系模式。' },
    ],
    'React': [
      { q: 'useState 的正确用法？', a: 'useState 是 React Hook，用于在函数组件中添加状态。基本用法：const [state, setState] = useState(initialValue)。注意：setState 是异步的；更新对象或数组时需要使用展开运算符或 Immer；避免直接修改 state。' },
      { q: 'useEffect 的依赖数组怎么写？', a: 'useEffect 的依赖数组控制何时重新执行 effect。1.不写依赖：每次渲染后都执行（易导致无限循环）2.空数组[]：只在首次渲染后执行（类似 componentDidMount）3.指定依赖 [value]：value 变化时执行。注意：不要包含不需要更新的值！' },
      { q: 'useCallback 和 useMemo 的区别？', a: 'useCallback 返回缓存的回调函数，用于避免子组件不必要的渲染。useMemo 返回缓存的计算结果，用于避免昂贵计算重复执行。当返回的是函数时用 useCallback，是值时用 useMemo。过早使用反而可能降低性能。' },
      { q: '什么是 React 的虚拟 DOM？', a: '虚拟 DOM 是真实 DOM 的 JavaScript 对象表示。当状态变化时，React 先在内存中创建新的虚拟 DOM 树，与旧树对比（diffing），找出最小变更集，然后批量更新真实 DOM。这种机制提高了渲染性能。' },
      { q: 'Context API 的使用场景？', a: 'Context API 用于跨层级传递数据，避免 prop drilling。适用场景：主题切换、用户信息、语言设置、全局状态。注意：不要过度使用，会影响性能。可以通过 useContext 或 Consumer 组件获取值。' },
      { q: 'React Fiber 架构的核心思想？', a: 'React Fiber 是 React 16 引入的协调算法核心思想：将渲染工作拆分成小单元，分配优先级，支持中断和恢复。这样可以让高优先级更新（如用户输入）优先处理，避免阻塞主线程，提升用户体验和动画流畅度。' },
      { q: 'useRef 和 useState 的区别？', a: 'useRef 返回一个 ref 对象，修改其 .current 属性不会触发重新渲染，常用于保存 DOM 引用或持久化不相关渲染的值。useState 修改变量会触发重新渲染。ref 的 .current 在渲染之间保持不变。' },
      { q: '什么是 React 的调和算法？', a: '调和（Reconciliation）是 React 用来找出从旧树到新树最小变更的算法。React 16 之前使用 Stack Reconciler，16+使用 Fiber Reconciler。Fiber 支持可中断渲染、优先级调度、并发更新。' },
      { q: 'useMemo 和 useCallback 的性能优化？', a: 'useMemo 缓存计算结果：const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])。useCallback 缓存函数：const memoizedFn = useCallback(() => doSomething(a, b), [a, b])。用于防止子组件不必要的重渲染。' },
      { q: 'React.memo 的作用是什么？', a: 'React.memo 是一个高阶组件，用于包装函数组件，实现浅比较的 props 验证。如果 props 没变，组件不会重新渲染。语法：const MemoizedComponent = React.memo(MyComponent)。仅在 props 变化时渲染，适合纯展示组件。' },
    ],
  };

  for (const [key, pairs] of Object.entries(qaPairs)) {
    if (deckName.includes(key)) {
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      return { front: pair.q, back: pair.a };
    }
  }
  return {
    front: '这是一个重要的知识点',
    back: '这是该知识点的详细解释和答案，需要认真学习掌握'
  };
}

function getQAForOtherDeck(deckName) {
  const qaPairs = {
    '雅思': [
      { q: '雅思听力 Section 1 通常是什么内容？', a: 'Section 1 通常是对话形式，涉及日常生活场景如租房、办理银行业务、预约服务等。重点考察捕捉具体信息的能力，如日期、时间、人名、地点等。' },
      { q: '雅思阅读的 True/False/Not Given 判断题有什么技巧？', a: 'TRUE：文中明确支持的说法；FALSE：与原文信息直接矛盾；Not Given：文中未提及或无法推断。注意区分"未提及"和"与原文矛盾"的情况。' },
      { q: '雅思口语 Part 2 如何组织答案？', a: '建议使用"4步法"：1.开场（直接回答话题）2.细节描述（加入时间、地点、人物）3.感受或原因 4.结尾总结。善用连接词，保持流畅度。' },
      { q: '雅思写作 Task 2 的大作文结构？', a: '经典四段式：1.开头（改写题目+表明观点）2.主体段1（论点1+支持细节）3.主体段2（论点2+支持细节）4.结尾（总结观点+升华）' },
      { q: '雅思核心词汇 "ubiquitous" 的用法？', a: 'ubiquitous 意为"无处不在的"，例句：Smartphones have become ubiquitous in modern society.（智能手机在现代社会已无处不在。）同义词：omnipresent, pervasive。' },
      { q: '雅思写作中 "furthermore" 和 "moreover" 的区别？', a: '两者都用于递进，但 moreover 更正式，furthermore 更通用。位置：通常放在句首，后接主谓。例：The environment is deteriorating. Furthermore, public health is being threatened.' },
      { q: '雅思口语如何避免重复使用 "very"？', a: '可以用更精确的形容词替代：very good → excellent/terrific；very bad → terrible/awful；very important → crucial/vital/essential；very big → massive/huge/enormous。' },
      { q: '雅思听力同义替换的常见形式？', a: '1.同义词替换（change → alter）2.词性替换（develop → development）3.解释性替换（doctor → medical practitioner）4.否定词替换（not remember → forget）' },
      { q: '雅思阅读定位词的使用技巧？', a: '优先选择特殊词汇（大写、数字、连字符词）、专业术语、罕见词汇作为定位词。避免选择常见词汇、抽象概念词。注意定位词的变形形式。' },
      { q: '雅思口语评分标准中 "lexical resource" 指的是什么？', a: '词汇多样性，考察：1.词汇的广度（使用不同话题的词汇）2.词汇的准确性和恰当性 3.对习语和固定搭配的掌握 4.避免词汇重复的能力。' },
    ],
    '托福': [
      { q: '托福阅读学术文章的常见结构？', a: '常见三种结构：1.问题-解决方案（提出问题及解决方法）2.新老对比（旧理论vs新发现）3.时间顺序（历史发展脉络）。了解结构有助于快速定位信息。' },
      { q: '托福听力学术演讲的常见信号词？', a: '因果：therefore, thus, so, consequently；对比：however, but, in contrast；举例：for example, for instance, such as；强调：importantly, notably, especially。' },
      { q: '托福独立口语 Task 1 的答题框架？', a: '使用"PREP"框架：P（Point）- 明确观点；R（Reason）- 给出原因；E（Example）- 具体例子；P（Point）- 重申观点。每个部分控制在一两句话内。' },
      { q: '托福综合写作的评分标准？', a: '考查：1.准确总结阅读和听力要点 2.清晰呈现两者关系（支持/反对）3.语言准确性和多样性 4.字数建议 150-225 词。听力反驳阅读的细节很重要。' },
      { q: '托福词汇题 "ubiquitous" 的同义词？', a: 'ubiquitous 意为"普遍存在的"，同义词包括：omnipresent、pervasive、widespread、universal。注意区分语境：ubiquitous 更强调"随处可见"。' },
      { q: '托福口语如何提高发音分数？', a: '1.重音准确（尤其是多音节词）2.语调自然（避免平板无起伏）3.连读和弱读（如 gonna, wanna）4.语速适中（太快显得不自然）5.元音饱满。' },
      { q: '托福阅读推断题的做法？', a: '不能直接选择原文原句，需要推断。技巧：1.排除与原文矛盾的选项 2.排除未提及的选项 3.选择基于原文合理推断的选项。注意"最合理"的推断。' },
      { q: '托福听力conversation和lecture的区别？', a: 'Conversation：学生与员工对话，话题日常，问题解决型。Lecture：教授讲课，学术性强，可能涉及专业术语。Lecture 需要更专注，注意教授的逻辑框架。' },
      { q: '托福写作如何避免中式英语？', a: '1.避免逐字翻译 2.使用英文同义词词典 3.学习固定搭配（collocation）4.多读英文原文培养语感 5.写完后检查语法结构是否地道。' },
      { q: '托福成绩单上的 "my best score" 是什么？', a: '托福会综合多次考试各部分的最高分生成 "MyBest Scores"，但前提是考生在两年有效期内参加过多次考试。 ETS 会自动选取听说读写各最高分组合。' },
    ],
    'Python': [
      { q: 'NumPy 中 array 和 list 的区别？', a: 'array 是同质数据（相同类型），支持向量化操作，速度快，内存效率高。list 是异质数据（不同类型），灵活但速度慢。NumPy 使用连续内存块存储，底层 C 实现。' },
      { q: 'Pandas 中 loc 和 iloc 的区别？', a: 'loc 基于标签索引（行名、列名），包括结束位置。iloc 基于整数位置（0起始），不包括结束位置。例：df.loc["A":"C"] vs df.iloc[0:2]' },
      { q: '什么是 Pandas 的 DataFrame？', a: 'DataFrame 是二维标记数据结构，类似电子表格或 SQL 表。有行索引和列名，支持不同类型数据。优势：灵活筛选、快速计算、丰富的数据操作。' },
      { q: 'NumPy 的广播机制是什么？', a: '广播允许不同形状的数组进行运算。小数组会"广播"以匹配大数组的形状。规则：从后向前比较维度，维度为1或相等即可兼容。例：(3,1)+(1,4)→(3,4)' },
      { q: 'Pandas 如何处理缺失值？', a: '常用方法：1.isnull()检测缺失值 2.dropna()删除含缺失值的行/列 3.fillna()填充缺失值（可用均值、中位数、指定值）4.interpolate()插值填充。' },
      { q: 'NumPy 中 np.mean() 和 np.average() 的区别？', a: 'mean() 计算简单算术平均。average() 可加权重参数 weights。例：np.average([1,2,3], weights=[1,2,1]) = (1*1+2*2+3*1)/(1+2+1)=2.25' },
      { q: '什么是 NumPy 的向量化和标量操作？', a: '向量化：用数组表达式替代显式循环，如 a*2 对数组每个元素乘2。标量操作：数组与单个数值运算。向量化代码更简洁、高效，利用 SIMD 指令。' },
      { q: 'Pandas 的 groupby 如何使用？', a: 'split-apply-combine 模式：1.split：按列分组 2.apply：对每组应用函数（sum, mean, count等）3.combine：合并结果。例：df.groupby("城市")["销量"].sum()' },
      { q: 'NumPy 如何创建特定数组？', a: '常用函数：np.zeros()全零、np.ones()全1、np.arange()范围数组、np.linspace()等差数组、np.random.rand()随机数组、np.eye()单位矩阵。' },
      { q: 'Pandas 如何合并两个 DataFrame？', a: '常用方法：pd.concat()轴向拼接（纵向或横向）、pd.merge()基于列的连接（类似SQL JOIN）、df.join()基于索引的连接。concat支持axis参数指定方向。' },
    ],
    'JavaScript': [
      { q: 'ES6 中 let、const 和 var 的区别？', a: 'var：函数作用域，存在变量提升，可重复声明。let：块级作用域，暂时性死区，不可重复声明。const：块级作用域，必须初始化，不可重新赋值（对象属性可改）。' },
      { q: '什么是 JavaScript 的闭包？', a: '闭包是函数记住并访问其词法作用域的能力，即使函数在其作用域外执行。用途：数据私有、工厂函数、函数柯里化。经典例子：计数器、缓存。' },
      { q: 'ES6 模板字符串如何使用？', a: '使用反引号(`)包裹，可嵌入变量和表达式：const msg = `Hello, ${name}!`；支持多行文本；可调用函数：${fn()}。相比拼接字符串更清晰。' },
      { q: '什么是 Promise 和 async/await？', a: 'Promise 是异步操作结果的对象，有 pending/fulfilled/rejected 三种状态。async/await 是 Promise 的语法糖，让异步代码看起来像同步代码，使代码更易读。' },
      { q: 'JavaScript 中 == 和 === 的区别？', a: '== 是宽松相等，会进行类型转换，如 "1"==1 为 true。=== 是严格相等，不进行类型转换，更安全。建议使用 ===，避免隐式转换带来的 bug。' },
      { q: '什么是 JavaScript 的事件循环？', a: '事件循环持续检查调用栈和任务队列。同步代码在栈中执行，异步代码在队列中等待。当栈空时，事件循环将队列中的回调推入栈执行。微任务（Promise）优先于宏任务。' },
      { q: 'ES6 解构赋值是什么？', a: '从数组或对象提取值赋给变量。数组：const [a,b]=arr；对象：const {name,age}=obj；可设置默认值：const {x=1}=obj；可忽略元素：const [,,third]=arr。' },
      { q: '什么是 JavaScript 的原型链？', a: '每个对象有 prototype 属性指向其原型对象，原型对象也有自己的原型，形成链式结构。属性查找沿链向上。Object.prototype 是链顶端。__proto__ 已废弃，用 Object.getPrototypeOf()' },
      { q: '箭头函数和普通函数的区别？', a: '箭头函数没有自己的 this（继承外层）、没有 arguments、没有 prototype。不能用作构造函数。不能直接作为对象方法。语法简洁：arr.map(x=>x*2)' },
      { q: '什么是 JavaScript 的 Promise.all()？', a: 'Promise.all() 接受 Promise 数组，返回一个新 Promise。当所有 Promise 都成功时 resolve，结果数组顺序与输入一致；任一失败则 reject。常用于并行执行多个异步操作。' },
    ],
    '解剖学': [
      { q: '人体有多少块骨骼？', a: '成人共有 206 块骨骼。分为中轴骨骼（80块：颅骨、脊柱、胸廓）和附肢骨骼（126块：上肢、下肢、肩带、骨盆）。骨骼提供支撑、保护、运动和造血功能。' },
      { q: '人体最大的骨骼是哪一块？', a: '股骨（大腿骨）是人体最大的骨骼，约占身高的1/4。它是人体最坚固的骨骼之一，主要功能是支撑体重和参与行走、跑步等运动。' },
      { q: '什么是解剖学中的"方位术语"？', a: '解剖学方位术语用于描述结构位置：上/下（头侧/足侧）、前/后（腹侧/背侧）、内/外、内侧/外侧（靠近中线/远离中线）、浅/深（体表/内部）。' },
      { q: '肩关节属于什么类型的关节？', a: '肩关节是球窝关节（杵臼关节），由肱骨头和肩胛骨的关节盂构成。特点：活动度最大但稳定性较差，是人体最灵活的关节，也是容易脱位的关节。' },
      { q: '人体有多少块肌肉？', a: '人体约有 600 多块骨骼肌，占体重的 40% 左右。这些肌肉通过肌腱附着在骨骼上，分为随意肌（受意识控制）和不随意肌（如心肌、平滑肌）。' },
      { q: '脊柱由多少节椎骨组成？', a: '脊柱由 33 节椎骨组成：颈椎7节、胸椎12节、腰椎5节、骶椎5节（愈合为骶骨）、尾椎4节（愈合为尾骨）。脊柱呈 S 形曲线，有减震和支撑功能。' },
      { q: '什么是解剖学的"三大轴"？', a: '解剖学三大轴：垂直轴（上下方向）、矢状轴（前后方向）、冠状轴（左右方向）。三大面：矢状面（前后面）、冠状面（左右面）、横断面（水平面）。' },
      { q: '肱二头肌的主要功能是什么？', a: '肱二头肌位于上臂前侧，主要功能：1.屈肘（主要作用）2.前臂旋后 3.协助肩关节屈曲。长头起于肩胛骨盂上结节，短头起于喙突。' },
      { q: '骨盆由哪些骨骼组成？', a: '骨盆由左右髋骨、骶骨和尾骨围成。每块髋骨由髂骨、坐骨和耻骨三骨愈合而成。骨盆分为大骨盆（假骨盆）和小骨盆（真骨盆），女性骨盆更适合分娩。' },
      { q: '膝关节的主要韧带有哪些？', a: '膝关节四大韧带：前交叉韧带（ACL）、后交叉韧带（PCL）防止前后移动、内侧副韧带（MCL）、外侧副韧带（LCL）防止内外翻。ACL损伤是常见的运动损伤。' },
    ],
    '药理学': [
      { q: '药物的半衰期是什么意思？', a: '半衰期（t½）是药物血浆浓度下降50%所需的时间。意义：1.决定给药频率 2.评估药物蓄积风险 3.计算稳态血药浓度时间。通常经过4-5个半衰期达稳态。' },
      { q: '什么是药物的"首过效应"？', a: '首过效应是药物经口服后在肝脏被首次通过代谢的现象，导致进入体循环的药量减少。可通过改变给药途径（舌下、直肠）或使用前药来避免。' },
      { q: '常用的降压药分类？', a: '五大类降压药：1.利尿剂（氢氯噻嗪）2.β受体阻滞剂（美托洛尔）3.钙通道阻滞剂（氨氯地平）4.ACE抑制剂（卡托普利）5.ARB（氯沙坦）。' },
      { q: '阿司匹林属于哪类药物？', a: '阿司匹林属于非甾体抗炎药（NSAIDs），具有镇痛、退热、抗炎、抗血小板聚集作用。低剂量阿司匹林用于预防心脑血管血栓。其机制是抑制 COX 酶。' },
      { q: '什么是药物的"治疗窗"？', a: '治疗窗是药物产生疗效而不产生毒性反应的血药浓度范围。窗口窄的药物（如华法林、地高辛）需要血药浓度监测，确保在有效浓度范围内。' },
      { q: '青霉素类抗生素的作用机制？', a: '青霉素抑制细菌细胞壁合成。具体机制：与青霉素结合蛋白（PBPs）结合，阻止细菌合成肽聚糖，导致细胞壁缺损，细菌在渗透压下破裂死亡。对繁殖期细菌作用强。' },
      { q: '什么是药物的"协同作用"？', a: '协同作用（Synergism）是两种药物合用效果大于单独使用效果之和。例如：磺胺甲噁唑+甲氧苄啶（复方新诺明）阻断叶酸合成的不同步骤，增强抗菌效果。' },
      { q: '吗啡属于哪类镇痛药？', a: '吗啡是阿片类镇痛药（麻醉性镇痛药），通过激动μ、κ、δ受体发挥镇痛、镇静、欣快感作用。用于重度疼痛，但有成瘾性，属于管制药品。' },
      { q: '什么是药物的"负荷剂量"？', a: '负荷剂量是为了迅速达到治疗血药浓度而首次使用的较大剂量。适用于半衰期较长的药物（如地高辛、胺碘酮）。给药后需用维持剂量补充消除的药量。' },
      { q: '胰岛素的主要适应症？', a: '胰岛素主要用于：1型糖尿病（必需）、2型糖尿病口服药无效时、 gestational diabetes、妊娠期糖尿病、 Diabetic ketoacidosis（糖尿病酮症酸中毒）等。' },
    ],
  };

  for (const [key, pairs] of Object.entries(qaPairs)) {
    if (deckName.includes(key)) {
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      return { front: pair.q, back: pair.a };
    }
  }
  return {
    front: '这是一个重要的知识点',
    back: '这是该知识点的详细解释和答案'
  };
}

generateMockData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());