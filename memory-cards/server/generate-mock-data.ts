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
          createdAt: randomDate(20 + Math.floor(Math.random() * 15)),
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

      const reviewCount = Math.floor(Math.random() * 21) + 5;
      const masteryLevel = Math.min(Math.floor(reviewCount / 5), 5);
      
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

generateMockData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
