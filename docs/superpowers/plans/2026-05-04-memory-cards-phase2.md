# 记忆卡片应用 Phase 2 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现分享功能 - 公开/私密分享卡片组、社区广场、导入功能

**Architecture:** 基于 Phase 1 的基础架构，添加分享相关的 API 和页面。

**Tech Stack:** 与 Phase 1 相同

---

## Phase 2 依赖

Phase 2 依赖 Phase 1 完成。开始 Phase 2 前，请确保：
- 所有 Phase 1 的代码已提交
- 数据库 schema 已包含 users, decks, cards, review_records 表

---

## 项目结构变更

```
server/src/
├── controllers/
│   ├── shareController.ts     # 新增
│   └── communityController.ts # 新增
├── services/
│   ├── shareService.ts        # 新增
│   └── communityService.ts    # 新增
└── routes/
    ├── shareRoutes.ts         # 新增
    └── communityRoutes.ts     # 新增

client/src/
├── pages/
│   ├── CommunityPage.tsx      # 新增
│   └── ShareSettingsPage.tsx  # 新增
└── components/
    └── deck/
        ├── DeckCard.tsx       # 新增
        └── ShareModal.tsx     # 新增
```

---

## Task 1: 数据库扩展

### 添加分享相关表

**Files:**
- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: 更新 Prisma Schema**

`server/prisma/schema.prisma` 末尾添加：

```prisma
model ShareLink {
  id        String   @id @default(uuid())
  deckId    String   @unique @map("deck_id")
  shareCode String   @unique @map("share_code")
  createdAt DateTime @default(now()) @map("created_at")

  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)

  @@map("share_links")
}

model DeckImport {
  id          String   @id @default(uuid())
  deckId      String   @map("deck_id")
  importedBy  String   @map("imported_by")
  importedAt  DateTime @default(now()) @map("imported_at")

  deck  Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)
  user  User @relation(fields: [importedBy], references: [id])

  @@map("deck_imports")
}

model PublicDeck {
  id          String   @id @default(uuid())
  deckId      String   @unique @map("deck_id")
  category    String?
  likeCount   Int      @default(0) @map("like_count")
  importCount Int      @default(0) @map("import_count")
  createdAt   DateTime @default(now()) @map("created_at")

  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)

  @@map("public_decks")
}

model Like {
  id        String   @id @default(uuid())
  deckId    String   @map("deck_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])

  @@unique([deckId, userId])
  @@map("likes")
}

model Favorite {
  id        String   @id @default(uuid())
  deckId    String   @map("deck_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])

  @@unique([deckId, userId])
  @@map("favorites")
}
```

- [ ] **Step 2: 更新数据库**

```bash
cd server && npx prisma db push
```

- [ ] **Step 3: 提交代码**

```bash
cd server && git add . && git commit -m "feat: 添加分享功能数据库表"
```

---

## Task 2: 分享功能 API

### 后端 - 分享服务

**Files:**
- Create: `server/src/services/shareService.ts`
- Create: `server/src/controllers/shareController.ts`
- Create: `server/src/routes/shareRoutes.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: 创建分享服务**

`server/src/services/shareService.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateShareCode(): string {
  return crypto.randomBytes(6).toString('hex');
}

export async function publishDeck(deckId: string, userId: string, category?: string) {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) throw new Error('卡片组不存在');

  const existing = await prisma.publicDeck.findUnique({ where: { deckId } });
  if (existing) {
    return prisma.publicDeck.update({
      where: { deckId },
      data: { category },
    });
  }

  return prisma.publicDeck.create({
    data: { deckId, category },
  });
}

export async function unpublishDeck(deckId: string, userId: string) {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) throw new Error('卡片组不存在');

  await prisma.publicDeck.deleteMany({ where: { deckId } });
  return { success: true };
}

export async function createShareLink(deckId: string, userId: string) {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) throw new Error('卡片组不存在');

  const existing = await prisma.shareLink.findUnique({ where: { deckId } });
  if (existing) {
    return { shareCode: existing.shareCode, shareUrl: `/import/${existing.shareCode}` };
  }

  const shareCode = generateShareCode();
  await prisma.shareLink.create({ data: { deckId, shareCode } });

  return { shareCode, shareUrl: `/import/${shareCode}` };
}

export async function getShareLink(deckId: string, userId: string) {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) throw new Error('卡片组不存在');

  const shareLink = await prisma.shareLink.findUnique({ where: { deckId } });
  if (!shareLink) return null;

  return { shareCode: shareLink.shareCode, shareUrl: `/import/${shareLink.shareCode}` };
}

export async function importDeckByCode(shareCode: string, userId: string) {
  const shareLink = await prisma.shareLink.findUnique({ where: { shareCode } });
  if (!shareLink) throw new Error('分享链接无效');

  const originalDeck = await prisma.deck.findUnique({
    where: { id: shareLink.deckId },
    include: { cards: true },
  });
  if (!originalDeck) throw new Error('卡片组不存在');

  const newDeck = await prisma.deck.create({
    data: {
      userId,
      name: `${originalDeck.name} (导入)`,
      description: originalDeck.description,
    },
  });

  for (const card of originalDeck.cards) {
    await prisma.card.create({
      data: {
        deckId: newDeck.id,
        front: card.front,
        back: card.back,
        cardType: card.cardType,
        mediaUrls: card.mediaUrls,
      },
    });
  }

  await prisma.deckImport.create({
    data: { deckId: shareLink.deckId, importedBy: userId },
  });

  await prisma.publicDeck.update({
    where: { deckId: shareLink.deckId },
    data: { importCount: { increment: 1 } },
  }).catch(() => {});

  return { deckId: newDeck.id, deckName: newDeck.name };
}
```

- [ ] **Step 2: 创建分享控制器**

`server/src/controllers/shareController.ts`:
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as shareService from '../services/shareService.js';

export async function publishDeck(req: AuthRequest, res: Response) {
  try {
    const { deckId, category } = req.body;
    const result = await shareService.publishDeck(deckId, req.userId!, category);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function unpublishDeck(req: AuthRequest, res: Response) {
  try {
    const { deckId } = req.body;
    await shareService.unpublishDeck(deckId, req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function createShareLink(req: AuthRequest, res: Response) {
  try {
    const { deckId } = req.body;
    const result = await shareService.createShareLink(deckId, req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getShareLink(req: AuthRequest, res: Response) {
  try {
    const deckId = req.params.deckId;
    const result = await shareService.getShareLink(deckId, req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function importDeck(req: AuthRequest, res: Response) {
  try {
    const { shareCode } = req.body;
    const result = await shareService.importDeckByCode(shareCode, req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
```

- [ ] **Step 3: 创建分享路由**

`server/src/routes/shareRoutes.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as shareController from '../controllers/shareController.js';

const router = Router();

router.use(authMiddleware);

router.post('/publish', shareController.publishDeck);
router.post('/unpublish', shareController.unpublishDeck);
router.post('/link', shareController.createShareLink);
router.get('/link/:deckId', shareController.getShareLink);
router.post('/import', shareController.importDeck);

export default router;
```

- [ ] **Step 4: 注册路由**

Modify `server/src/index.ts`:
```typescript
import shareRoutes from './routes/shareRoutes.js';

app.use('/api/share', shareRoutes);
```

- [ ] **Step 5: 测试 API**

```bash
# 发布卡片组
curl -X POST http://localhost:3001/api/share/publish \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deckId":"DECK_ID","category":"语言"}'

# 创建分享链接
curl -X POST http://localhost:3001/api/share/link \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deckId":"DECK_ID"}'

# 导入卡片组
curl -X POST http://localhost:3001/api/share/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shareCode":"SHARE_CODE"}'
```

- [ ] **Step 6: 提交代码**

```bash
cd server && git add . && git commit -m "feat: 添加分享功能 API"
```

---

## Task 3: 社区广场 API

### 后端 - 社区服务

**Files:**
- Create: `server/src/services/communityService.ts`
- Create: `server/src/controllers/communityController.ts`
- Create: `server/src/routes/communityRoutes.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: 创建社区服务**

`server/src/services/communityService.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPublicDecks(params: {
  category?: string;
  sortBy?: 'latest' | 'popular';
  page?: number;
  limit?: number;
}) {
  const { category, sortBy = 'latest', page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (category) where.category = category;

  const orderBy: any = sortBy === 'popular'
    ? { importCount: 'desc' }
    : { createdAt: 'desc' };

  const [decks, total] = await Promise.all([
    prisma.publicDeck.findMany({
      where,
      include: {
        deck: {
          include: {
            _count: { select: { cards: true } },
            user: { select: { id: true, nickname: true } },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.publicDeck.count({ where }),
  ]);

  return {
    decks: decks.map(pd => ({
      id: pd.deck.id,
      name: pd.deck.name,
      description: pd.deck.description,
      cardCount: pd.deck._count.cards,
      authorId: pd.deck.user.id,
      authorName: pd.deck.user.nickname,
      category: pd.category,
      likeCount: pd.likeCount,
      importCount: pd.importCount,
      createdAt: pd.deck.createdAt,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function searchPublicDecks(query: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [decks, total] = await Promise.all([
    prisma.publicDeck.findMany({
      where: {
        deck: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      },
      include: {
        deck: {
          include: {
            _count: { select: { cards: true } },
            user: { select: { id: true, nickname: true } },
          },
        },
      },
      skip,
      take: limit,
    }),
    prisma.publicDeck.count({
      where: {
        deck: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      },
    }),
  ]);

  return {
    decks: decks.map(pd => ({
      id: pd.deck.id,
      name: pd.deck.name,
      description: pd.deck.description,
      cardCount: pd.deck._count.cards,
      authorId: pd.deck.user.id,
      authorName: pd.deck.user.nickname,
      category: pd.category,
      likeCount: pd.likeCount,
      importCount: pd.importCount,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function likeDeck(deckId: string, userId: string) {
  const publicDeck = await prisma.publicDeck.findUnique({ where: { deckId } });
  if (!publicDeck) throw new Error('卡片组未公开');

  const existing = await prisma.like.findUnique({
    where: { deckId_userId: { deckId, userId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    await prisma.publicDeck.update({
      where: { deckId },
      data: { likeCount: { decrement: 1 } },
    });
    return { liked: false };
  }

  await prisma.like.create({ data: { deckId, userId } });
  await prisma.publicDeck.update({
    where: { deckId },
    data: { likeCount: { increment: 1 } },
  });
  return { liked: true };
}

export async function favoriteDeck(deckId: string, userId: string) {
  const existing = await prisma.favorite.findUnique({
    where: { deckId_userId: { deckId, userId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { favorited: false };
  }

  await prisma.favorite.create({ data: { deckId, userId } });
  return { favorited: true };
}

export async function getUserFavorites(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      deck: {
        include: {
          _count: { select: { cards: true } },
          user: { select: { id: true, nickname: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map(f => ({
    id: f.deck.id,
    name: f.deck.name,
    description: f.deck.description,
    cardCount: f.deck._count.cards,
    authorId: f.deck.user.id,
    authorName: f.deck.user.nickname,
  }));
}
```

- [ ] **Step 2: 创建社区控制器**

`server/src/controllers/communityController.ts`:
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as communityService from '../services/communityService.js';

export async function getPublicDecks(req: AuthRequest, res: Response) {
  try {
    const { category, sortBy, page, limit } = req.query;
    const result = await communityService.getPublicDecks({
      category: category as string,
      sortBy: sortBy as 'latest' | 'popular',
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function searchDecks(req: AuthRequest, res: Response) {
  try {
    const { q, page, limit } = req.query;
    if (!q) return res.status(400).json({ error: '搜索关键词不能为空' });
    const result = await communityService.searchPublicDecks(
      q as string,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function likeDeck(req: AuthRequest, res: Response) {
  try {
    const { deckId } = req.body;
    const result = await communityService.likeDeck(deckId, req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function favoriteDeck(req: AuthRequest, res: Response) {
  try {
    const { deckId } = req.body;
    const result = await communityService.favoriteDeck(deckId, req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getFavorites(req: AuthRequest, res: Response) {
  try {
    const result = await communityService.getUserFavorites(req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
```

- [ ] **Step 3: 创建社区路由**

`server/src/routes/communityRoutes.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as communityController from '../controllers/communityController.js';

const router = Router();

router.use(authMiddleware);

router.get('/decks', communityController.getPublicDecks);
router.get('/search', communityController.searchDecks);
router.post('/like', communityController.likeDeck);
router.post('/favorite', communityController.favoriteDeck);
router.get('/favorites', communityController.getFavorites);

export default router;
```

- [ ] **Step 4: 注册路由**

Modify `server/src/index.ts`:
```typescript
import communityRoutes from './routes/communityRoutes.js';

app.use('/api/community', communityRoutes);
```

- [ ] **Step 5: 测试 API**

```bash
# 获取公开卡片组
curl http://localhost:3001/api/community/decks \
  -H "Authorization: Bearer YOUR_TOKEN"

# 搜索
curl "http://localhost:3001/api/community/search?q=英语" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 点赞
curl -X POST http://localhost:3001/api/community/like \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deckId":"DECK_ID"}'
```

- [ ] **Step 6: 提交代码**

```bash
cd server && git add . && git commit -m "feat: 添加社区广场 API"
```

---

## Task 4: 分享页面组件

### 前端 - 分享设置页面

**Files:**
- Create: `client/src/pages/ShareSettingsPage.tsx`
- Create: `client/src/components/deck/ShareModal.tsx`
- Create: `client/src/components/deck/DeckCard.tsx`

- [ ] **Step 1: 创建分享 Modal 组件**

`client/src/components/deck/ShareModal.tsx`:
```typescript
import { useState, useEffect } from 'react';
import api from '../../services/api';

interface ShareModalProps {
  deckId: string;
  deckName: string;
  isPublic: boolean;
  onClose: () => void;
  onPublishChange: (isPublic: boolean) => void;
}

export default function ShareModal({ deckId, deckName, isPublic, onClose, onPublishChange }: ShareModalProps) {
  const [shareLink, setShareLink] = useState<{ shareCode: string; shareUrl: string } | null>(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [publicStatus, setPublicStatus] = useState(isPublic);

  useEffect(() => {
    fetchShareLink();
  }, [deckId]);

  const fetchShareLink = async () => {
    try {
      const res = await api.get(`/share/link/${deckId}`);
      setShareLink(res.data);
    } catch {
      setShareLink(null);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      await api.post('/share/publish', { deckId, category });
      setPublicStatus(true);
      onPublishChange(true);
    } catch (err) {
      console.error('发布失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setLoading(true);
    try {
      await api.post('/share/unpublish', { deckId });
      setPublicStatus(false);
      onPublishChange(false);
    } catch (err) {
      console.error('取消发布失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    setLoading(true);
    try {
      const res = await api.post('/share/link', { deckId });
      setShareLink(res.data);
    } catch (err) {
      console.error('创建链接失败', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(window.location.origin + shareLink.shareUrl);
      alert('链接已复制！');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">分享设置</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <p className="text-gray-600 mb-4">{deckName}</p>

        <div className="mb-6">
          <h4 className="font-medium mb-2">公开分享</h4>
          <p className="text-sm text-gray-500 mb-2">公开后卡片组会出现在社区广场，任何人都能浏览和导入</p>
          {publicStatus ? (
            <div className="flex items-center justify-between bg-green-50 p-3 rounded">
              <span className="text-green-600">✓ 已公开</span>
              <button
                onClick={handleUnpublish}
                disabled={loading}
                className="text-sm text-red-500 hover:underline"
              >
                取消公开
              </button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="选择分类（可选）"
                className="w-full px-4 py-2 border rounded mb-2"
              />
              <button
                onClick={handlePublish}
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                公开分享
              </button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-2">私密分享</h4>
          <p className="text-sm text-gray-500 mb-2">生成邀请链接，只有获得链接的人才能导入</p>
          {shareLink ? (
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm mb-2 break-all">{window.location.origin}{shareLink.shareUrl}</p>
              <button
                onClick={copyToClipboard}
                className="w-full bg-gray-200 py-2 rounded hover:bg-gray-300"
              >
                复制链接
              </button>
            </div>
          ) : (
            <button
              onClick={handleCreateLink}
              disabled={loading}
              className="w-full border border-blue-500 text-blue-500 py-2 rounded hover:bg-blue-50"
            >
              生成分享链接
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建卡片组卡片组件**

`client/src/components/deck/DeckCard.tsx`:
```typescript
import { Link } from 'react-router-dom';

interface DeckCardProps {
  id: string;
  name: string;
  description?: string;
  cardCount: number;
  authorName?: string;
  likeCount?: number;
  importCount?: number;
  showAuthor?: boolean;
  onImport?: () => void;
}

export default function DeckCard({
  id,
  name,
  description,
  cardCount,
  authorName,
  likeCount,
  importCount,
  showAuthor = false,
  onImport,
}: DeckCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <Link to={`/decks/${id}`}>
        <h3 className="font-bold text-lg mb-2 hover:text-blue-500">{name}</h3>
      </Link>
      <p className="text-gray-500 text-sm mb-2">{description || '暂无描述'}</p>
      <p className="text-blue-500 text-sm mb-2">{cardCount} 张卡片</p>
      {showAuthor && authorName && (
        <p className="text-gray-400 text-xs mb-2">by {authorName}</p>
      )}
      <div className="flex items-center gap-4 text-gray-400 text-sm">
        <span>👍 {likeCount || 0}</span>
        <span>📥 {importCount || 0}</span>
      </div>
      {onImport && (
        <button
          onClick={(e) => { e.preventDefault(); onImport(); }}
          className="mt-3 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          导入
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 创建分享设置页面**

`client/src/pages/ShareSettingsPage.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ShareModal from '../components/deck/ShareModal';
import Layout from '../components/common/Layout';

export default function ShareSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [deckName, setDeckName] = useState('');

  useEffect(() => {
    if (id) {
      fetchDeck();
    }
  }, [id]);

  const fetchDeck = async () => {
    try {
      const res = await api.get(`/decks/${id}`);
      setDeckName(res.data.name);
    } catch (err) {
      console.error('获取卡片组失败', err);
    }
  };

  return (
    <Layout>
      <div className="mb-4">
        <button onClick={() => navigate(`/decks/${id}`)} className="text-blue-500 hover:underline">
          ← 返回卡片组
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6">分享设置</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
        >
          管理分享
        </button>
      </div>

      {showModal && id && (
        <ShareModal
          deckId={id}
          deckName={deckName}
          isPublic={isPublic}
          onClose={() => setShowModal(false)}
          onPublishChange={setIsPublic}
        />
      )}
    </Layout>
  );
}
```

- [ ] **Step 4: 更新 DecksPage 添加分享入口**

`client/src/pages/DecksPage.tsx`:
在卡片组卡片上添加分享按钮：

```typescript
// 在 deck 卡片组件中添加
<Link to={`/decks/${deck.id}/share`} className="text-blue-500 text-sm hover:underline">
  分享
</Link>
```

- [ ] **Step 5: 添加路由**

Modify `client/src/App.tsx`:
```typescript
import ShareSettingsPage from './pages/ShareSettingsPage';

<Route path="/decks/:id/share" element={<ProtectedRoute><ShareSettingsPage /></ProtectedRoute>} />
```

- [ ] **Step 6: 提交代码**

```bash
cd client && git add . && git commit -m "feat: 添加分享设置页面"
```

---

## Task 5: 社区广场页面

**Files:**
- Create: `client/src/pages/CommunityPage.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: 创建社区广场页面**

`client/src/pages/CommunityPage.tsx`:
```typescript
import { useState, useEffect } from 'react';
import api from '../services/api';
import DeckCard from '../components/deck/DeckCard';
import Layout from '../components/common/Layout';

interface PublicDeck {
  id: string;
  name: string;
  description?: string;
  cardCount: number;
  authorId: string;
  authorName: string;
  category?: string;
  likeCount: number;
  importCount: number;
}

const CATEGORIES = ['全部', '语言', '编程', '历史', '科学', '其他'];
const SORT_OPTIONS = [
  { value: 'latest', label: '最新' },
  { value: 'popular', label: '最热' },
];

export default function CommunityPage() {
  const [decks, setDecks] = useState<PublicDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDecks();
  }, [category, sortBy, page]);

  const fetchDecks = async () => {
    setLoading(true);
    try {
      const params: any = { sortBy, page };
      if (category) params.category = category;
      const res = await api.get('/community/decks', { params });
      setDecks(res.data.decks);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('获取公开卡片组失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchDecks();
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/community/search', { params: { q: searchQuery } });
      setDecks(res.data.decks);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('搜索失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (deckId: string) => {
    try {
      await api.post('/share/import', { deckId });
      alert('导入成功！');
    } catch (err: any) {
      alert(err.response?.data?.error || '导入失败');
    }
  };

  const handleLike = async (deckId: string) => {
    try {
      await api.post('/community/like', { deckId });
      fetchDecks();
    } catch (err) {
      console.error('点赞失败', err);
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">社区广场</h2>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索卡片组..."
            className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            搜索
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat === '全部' ? '' : cat); setPage(1); }}
              className={`px-4 py-1 rounded-full text-sm ${
                (cat === '全部' && !category) || category === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSortBy(opt.value as 'latest' | 'popular'); setPage(1); }}
              className={`px-4 py-1 rounded text-sm ${
                sortBy === opt.value ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">加载中...</div>
      ) : decks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-4xl mb-4">🔍</p>
          <p>没有找到相关卡片组</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {decks.map((deck) => (
              <div key={deck.id}>
                <DeckCard
                  {...deck}
                  showAuthor
                  onImport={() => handleImport(deck.id)}
                />
                <button
                  onClick={() => handleLike(deck.id)}
                  className="mt-2 text-sm text-gray-500 hover:text-blue-500"
                >
                  👍 点赞
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-4 py-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
```

- [ ] **Step 2: 添加路由**

Modify `client/src/App.tsx`:
```typescript
import CommunityPage from './pages/CommunityPage';

<Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
```

- [ ] **Step 3: 添加导入页面**

`client/src/pages/ImportPage.tsx`:
```typescript
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/common/Layout';

export default function ImportPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/share/import', { shareCode: code });
      alert(`导入成功！卡片组 "${res.data.deckName}" 已添加到你的账户`);
      navigate(`/decks/${res.data.deckId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || '导入失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-2xl font-bold mb-4">导入卡片组</h2>
        <p className="text-gray-600 mb-6">分享码: {code}</p>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        <button
          onClick={handleImport}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '导入中...' : '确认导入'}
        </button>
      </div>
    </Layout>
  );
}
```

Add route:
```typescript
<Route path="/import/:code" element={<ProtectedRoute><ImportPage /></ProtectedRoute>} />
```

- [ ] **Step 4: 测试社区功能**

```bash
# 1. 发布卡片组
# 2. 访问社区广场
# 3. 搜索和浏览
# 4. 导入卡片组
```

- [ ] **Step 5: 提交代码**

```bash
cd client && git add . && git commit -m "feat: 添加社区广场页面"
cd server && git add . && git commit -m "feat: Phase 2 完成"
```

---

## Phase 2 总结

完成后的功能：
- ✅ 公开分享（发布到社区广场）
- ✅ 私密分享（生成分享链接）
- ✅ 社区广场浏览和搜索
- ✅ 按分类和热度筛选
- ✅ 导入他人分享的卡片组
- ✅ 点赞功能
