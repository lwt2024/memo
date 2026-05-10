# Phase 2: 分享功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现卡片组分享功能和社区广场浏览功能，包括公开分享、私密分享、导入功能和社区浏览筛选。

**Architecture:** 采用前后端分离架构，后端新增分享相关 API（生成邀请码、导入卡片组），前端新增社区广场页面和分享管理界面。数据库已有 `isPublic` 字段，只需扩展相关功能。

**Tech Stack:** React + TypeScript (前端), Node.js + Express + Prisma (后端), SQLite (数据库)

---

## 文件结构

```
客户端 (client/src)
├── pages/
│   └── CommunityPage.tsx          # 社区广场页面（已有占位符）
├── components/common/
│   ├── DeckCard.tsx               # 公开卡片组展示卡片（新建）
│   └── ShareModal.tsx             # 分享设置弹窗（新建）
└── services/
    └── api.ts                     # API 调用

服务端 (server/src)
├── routes/
│   ├── deckRoutes.ts              # 添加分享相关路由
│   └── shareRoutes.ts             # 分享和导入路由（新建）
├── controllers/
│   ├── deckController.ts           # 添加公开/私密分享方法
│   └── shareController.ts         # 导入控制器（新建）
├── services/
│   ├── deckService.ts             # 添加分享相关服务方法
│   └── shareService.ts            # 分享和导入服务（新建）
└── prisma/
    └── schema.prisma              # 添加邀请码字段

```

---

## Task 1: 数据库添加邀请码字段

**Files:**
- Modify: `server/prisma/schema.prisma:27-38`

- [ ] **Step 1: 添加 inviteCode 字段到 Deck 模型**

在 `isPublic` 字段后添加 `inviteCode` 字段用于私密分享：

```prisma
model Deck {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  name        String
  description String?
  isPublic    Boolean  @default(false) @map("is_public")
  inviteCode  String?  @unique @map("invite_code")  // 私密分享邀请码
  createdAt   DateTime @default(now()) @map("created_at")

  user  User   @relation(fields: [userId], references: [id])
  cards Card[]

  @@map("decks")
}
```

- [ ] **Step 2: 运行 Prisma 迁移**

```bash
cd /workspace/memory-cards/server && npx prisma db push
```

- [ ] **Step 3: 提交代码**

```bash
git add server/prisma/schema.prisma
git commit -m "feat: add inviteCode field to Deck model for private sharing"
```

---

## Task 2: 后端 - 分享服务层

**Files:**
- Create: `server/src/services/shareService.ts`
- Modify: `server/src/services/deckService.ts`

- [ ] **Step 1: 创建 shareService.ts**

```typescript
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
        select: { nickname: true, avatar: true },
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
```

- [ ] **Step 2: 修改 deckService.ts 添加公开/私密分享方法**

在 `server/src/services/deckService.ts` 末尾添加：

```typescript
export async function toggleDeckPublic(deckId: string, userId: string) {
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId },
  });

  if (!deck) {
    throw new Error('卡片组不存在');
  }

  return prisma.deck.update({
    where: { id: deckId },
    data: { isPublic: !deck.isPublic },
  });
}

export async function getDeckShareInfo(deckId: string, userId: string) {
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId },
    select: {
      id: true,
      name: true,
      isPublic: true,
      inviteCode: true,
    },
  });

  if (!deck) {
    throw new Error('卡片组不存在');
  }

  return {
    ...deck,
    shareUrl: deck.inviteCode ? `/import/${deck.inviteCode}` : null,
  };
}
```

- [ ] **Step 3: 提交代码**

```bash
git add server/src/services/shareService.ts server/src/services/deckService.ts
git commit -m "feat: add sharing service for public and private deck sharing"
```

---

## Task 3: 后端 - 分享控制器和路由

**Files:**
- Create: `server/src/controllers/shareController.ts`
- Create: `server/src/routes/shareRoutes.ts`
- Modify: `server/src/controllers/deckController.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: 创建 shareController.ts**

```typescript
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as shareService from '../services/shareService.js';

export async function setPublic(req: AuthRequest, res: Response) {
  try {
    const { deckId } = req.params;
    const { isPublic } = req.body;
    const result = await shareService.setDeckPublic(deckId, req.userId!, isPublic);
    if (result.count === 0) {
      return res.status(404).json({ error: '卡片组不存在' });
    }
    res.json({ success: true, isPublic });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function generateInvite(req: AuthRequest, res: Response) {
  try {
    const { deckId } = req.params;
    const result = await shareService.generateInviteLink(deckId, req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function importByCode(req: AuthRequest, res: Response) {
  try {
    const { inviteCode } = req.body;
    const newDeck = await shareService.importDeckByCode(inviteCode, req.userId!);
    res.status(201).json(newDeck);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getPublicDecks(req: AuthRequest, res: Response) {
  try {
    const { sortBy, search } = req.query;
    const decks = await shareService.getPublicDecks({
      sortBy: sortBy as 'latest' | 'popular',
      search: search as string,
    });
    res.json(decks);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
```

- [ ] **Step 2: 创建 shareRoutes.ts**

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as shareController from '../controllers/shareController.js';

const router = Router();

router.use(authMiddleware);

router.get('/public', shareController.getPublicDecks);
router.post('/import', shareController.importByCode);
router.post('/:deckId/public', shareController.setPublic);
router.post('/:deckId/invite', shareController.generateInvite);

export default router;
```

- [ ] **Step 3: 修改 deckController.ts 添加新方法**

在 `server/src/controllers/deckController.ts` 末尾添加：

```typescript
export async function togglePublic(req: AuthRequest, res: Response) {
  try {
    const result = await deckService.toggleDeckPublic(req.params.id, req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getShareInfo(req: AuthRequest, res: Response) {
  try {
    const shareInfo = await deckService.getDeckShareInfo(req.params.id, req.userId!);
    res.json(shareInfo);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
```

- [ ] **Step 4: 修改 deckRoutes.ts 添加新路由**

```typescript
router.put('/:id/public', deckController.togglePublic);
router.get('/:id/share', deckController.getShareInfo);
```

- [ ] **Step 5: 修改 index.ts 注册新路由**

```typescript
import shareRoutes from './routes/shareRoutes.js';

// 在现有路由注册后添加
app.use('/api/share', shareRoutes);
```

- [ ] **Step 6: 提交代码**

```bash
git add server/src/controllers/shareController.ts server/src/routes/shareRoutes.ts server/src/controllers/deckController.ts server/src/routes/deckRoutes.ts server/src/index.ts
git commit -m "feat: add share controller and routes for deck sharing"
```

---

## Task 4: 前端 - API 服务扩展

**Files:**
- Modify: `client/src/services/api.ts`

- [ ] **Step 1: 添加分享相关 API 方法**

在 `client/src/services/api.ts` 中添加：

```typescript
// 分享相关
export const shareApi = {
  getPublicDecks: (params?: { sortBy?: string; search?: string }) =>
    api.get('/share/public', { params }),

  importByCode: (inviteCode: string) =>
    api.post('/share/import', { inviteCode }),

  setPublic: (deckId: string, isPublic: boolean) =>
    api.post(`/share/${deckId}/public`, { isPublic }),

  generateInvite: (deckId: string) =>
    api.post(`/share/${deckId}/invite`),

  togglePublic: (deckId: string) =>
    api.put(`/decks/${deckId}/public`),

  getShareInfo: (deckId: string) =>
    api.get(`/decks/${deckId}/share`),
};
```

- [ ] **Step 2: 提交代码**

```bash
git add client/src/services/api.ts
git commit -m "feat: add sharing API methods"
```

---

## Task 5: 前端 - 分享设置弹窗组件

**Files:**
- Create: `client/src/components/common/ShareModal.tsx`

- [ ] **Step 1: 创建 ShareModal.tsx**

```typescript
import { useState } from 'react';
import { shareApi } from '../../services/api';

interface ShareModalProps {
  deckId: string;
  deckName: string;
  isPublic: boolean;
  inviteCode?: string | null;
  onClose: () => void;
  onShareChange: (isPublic: boolean) => void;
}

export default function ShareModal({ deckId, deckName, isPublic, inviteCode, onClose, onShareChange }: ShareModalProps) {
  const [publicStatus, setPublicStatus] = useState(isPublic);
  const [currentCode, setCurrentCode] = useState(inviteCode);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePublicToggle = async () => {
    setLoading(true);
    try {
      const newStatus = !publicStatus;
      await shareApi.setPublic(deckId, newStatus);
      setPublicStatus(newStatus);
      onShareChange(newStatus);
    } catch (err) {
      console.error('设置公开失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    setLoading(true);
    try {
      const res = await shareApi.generateInvite(deckId);
      setCurrentCode(res.data.inviteCode);
    } catch (err) {
      console.error('生成邀请码失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (currentCode) {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
          分享设置
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {deckName}
        </p>

        {/* 公开分享 */}
        <div className="flex items-center justify-between p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
          <div>
            <p className="font-medium" style={{ color: 'var(--color-text)' }}>公开分享</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>在社区广场展示</p>
          </div>
          <button
            onClick={handlePublicToggle}
            disabled={loading}
            className={`w-12 h-6 rounded-full transition-colors ${
              publicStatus ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
              publicStatus ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        {/* 私密分享 */}
        <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: 'var(--color-background-secondary)' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>私密分享</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>生成邀请码</p>
            </div>
          </div>

          {currentCode ? (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 px-4 py-2 rounded-lg font-mono text-lg tracking-wider" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-primary)' }}>
                {currentCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-lg text-white text-sm"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateInvite}
              disabled={loading}
              className="w-full mt-3 px-4 py-2 rounded-lg text-white text-sm"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              生成邀请码
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-medium"
          style={{ backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-text)' }}
        >
          关闭
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交代码**

```bash
git add client/src/components/common/ShareModal.tsx
git commit -m "feat: add ShareModal component for deck sharing settings"
```

---

## Task 6: 前端 - 公开卡片组展示组件

**Files:**
- Create: `client/src/components/common/PublicDeckCard.tsx`

- [ ] **Step 1: 创建 PublicDeckCard.tsx**

```typescript
import { useNavigate } from 'react-router-dom';

interface PublicDeckCardProps {
  deck: {
    id: string;
    name: string;
    description?: string;
    user: {
      nickname?: string;
      avatar?: string;
    };
    _count: {
      cards: number;
    };
    createdAt: string;
  };
  onImport: (deckId: string) => void;
}

export default function PublicDeckCard({ deck, onImport }: PublicDeckCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-2xl p-5 transition-all hover:shadow-lg cursor-pointer"
      style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
      onClick={() => navigate(`/community/${deck.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text)' }}>
            {deck.name}
          </h3>
          {deck.description && (
            <p className="text-sm line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
              {deck.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
            {(deck.user?.nickname || 'U')[0].toUpperCase()}
          </div>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {deck.user?.nickname || '匿名用户'}
          </span>
        </div>
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {deck._count.cards} 张卡片
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onImport(deck.id);
        }}
        className="w-full py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
        style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
      >
        导入到我的卡片组
      </button>
    </div>
  );
}
```

- [ ] **Step 2: 提交代码**

```bash
git add client/src/components/common/PublicDeckCard.tsx
git commit -m "feat: add PublicDeckCard component for community browsing"
```

---

## Task 7: 前端 - 社区广场页面实现

**Files:**
- Modify: `client/src/pages/CommunityPage.tsx`

- [ ] **Step 1: 实现完整的 CommunityPage.tsx**

```typescript
import { useState, useEffect } from 'react';
import { shareApi } from '../services/api';
import Layout from '../components/common/Layout';
import PublicDeckCard from '../components/common/PublicDeckCard';

interface PublicDeck {
  id: string;
  name: string;
  description?: string;
  user: {
    nickname?: string;
    avatar?: string;
  };
  _count: {
    cards: number;
  };
  createdAt: string;
}

export default function CommunityPage() {
  const [decks, setDecks] = useState<PublicDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPublicDecks();
  }, [sortBy]);

  const fetchPublicDecks = async () => {
    setLoading(true);
    try {
      const res = await shareApi.getPublicDecks({ sortBy });
      setDecks(res.data);
    } catch (err) {
      console.error('获取公开卡片组失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPublicDecks();
      return;
    }
    setLoading(true);
    try {
      const res = await shareApi.getPublicDecks({ search: searchQuery });
      setDecks(res.data);
    } catch (err) {
      console.error('搜索失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (deckId: string) => {
    setImportingId(deckId);
    setImportMessage(null);
    try {
      const res = await shareApi.importByCode(deckId);
      setImportMessage({ type: 'success', text: `导入成功！卡片组 "${res.data.name}" 已添加到您的账户` });
      setTimeout(() => setImportMessage(null), 3000);
    } catch (err: any) {
      setImportMessage({ type: 'error', text: err.response?.data?.error || '导入失败' });
      setTimeout(() => setImportMessage(null), 3000);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
          社区广场
        </h2>

        {/* 导入消息提示 */}
        {importMessage && (
          <div className={`mb-4 p-4 rounded-xl ${
            importMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {importMessage.text}
          </div>
        )}

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="搜索卡片组..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 rounded-xl pl-10"
              style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                sortBy === 'latest' ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: sortBy === 'latest' ? 'var(--color-primary)' : 'var(--color-card)',
                color: sortBy === 'latest' ? 'white' : 'var(--color-text)',
                border: `1px solid ${sortBy === 'latest' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              最新
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                sortBy === 'popular' ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: sortBy === 'popular' ? 'var(--color-primary)' : 'var(--color-card)',
                color: sortBy === 'popular' ? 'white' : 'var(--color-text)',
                border: `1px solid ${sortBy === 'popular' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              最热
            </button>
          </div>
        </div>

        {/* 卡片列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : decks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📚</p>
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              暂无公开卡片组
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              快去分享您的卡片组吧！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <PublicDeckCard
                key={deck.id}
                deck={deck}
                onImport={handleImport}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: 提交代码**

```bash
git add client/src/pages/CommunityPage.tsx
git commit -m "feat: implement community page with deck browsing and import"
```

---

## Task 8: 前端 - 在卡片组详情页添加分享按钮

**Files:**
- Modify: `client/src/pages/DeckDetailPage.tsx`

- [ ] **Step 1: 添加分享按钮到卡片组详情页**

找到 DeckDetailPage.tsx 中的卡片组头部区域，添加分享按钮：

在 "复习" 按钮旁边添加分享按钮：

```tsx
<button
  onClick={() => setShowShareModal(true)}
  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
  style={{ backgroundColor: 'var(--color-background-secondary)', color: 'var(--color-text)' }}
>
  分享
</button>
```

添加状态和导入：

```tsx
const [showShareModal, setShowShareModal] = useState(false);

// 在导入语句中添加
import ShareModal from '../components/common/ShareModal';

// 在 JSX 中添加弹窗组件（在 return 的 Layout 内）
{showShareModal && deck && (
  <ShareModal
    deckId={deck.id}
    deckName={deck.name}
    isPublic={deck.isPublic || false}
    inviteCode={deck.inviteCode}
    onClose={() => setShowShareModal(false)}
    onShareChange={(isPublic) => {
      setDeck((prev: any) => ({ ...prev, isPublic }));
    }}
  />
)}
```

- [ ] **Step 2: 更新 Deck 类型**

在 `client/src/types/index.ts` 中确保 Deck 类型包含新字段：

```typescript
interface Deck {
  id: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  inviteCode?: string | null;
  // ... 其他字段
}
```

- [ ] **Step 3: 提交代码**

```bash
git add client/src/pages/DeckDetailPage.tsx client/src/types/index.ts
git commit -m "feat: add share button to deck detail page"
```

---

## Task 9: 前端 - 导入页面实现

**Files:**
- Create: `client/src/pages/ImportPage.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: 创建 ImportPage.tsx**

```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shareApi } from '../services/api';
import Layout from '../components/common/Layout';

export default function ImportPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deckName, setDeckName] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      handleImport();
    }
  }, [code]);

  const handleImport = async () => {
    if (!code) return;

    setImporting(true);
    setError(null);

    try {
      const res = await shareApi.importByCode(code);
      setDeckName(res.data.name);
      setTimeout(() => {
        navigate(`/decks/${res.data.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || '导入失败');
    } finally {
      setLoading(false);
      setImporting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto text-center py-20">
        {loading || importing ? (
          <>
            <div
              className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
            />
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              正在导入卡片组...
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              邀请码: {code}
            </p>
          </>
        ) : error ? (
          <>
            <p className="text-6xl mb-4">😢</p>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              导入失败
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/community')}
              className="px-6 py-3 rounded-xl text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              浏览社区
            </button>
          </>
        ) : deckName ? (
          <>
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              导入成功！
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              {deckName}
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              即将跳转到卡片组...
            </p>
          </>
        ) : null}
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: 修改 App.tsx 添加路由**

```tsx
// 在现有 import 中添加
import ImportPage from './pages/ImportPage';

// 在路由配置中添加
<Route path="/import/:code" element={<ImportPage />} />
```

- [ ] **Step 3: 提交代码**

```bash
git add client/src/pages/ImportPage.tsx client/src/App.tsx
git commit -m "feat: add import page for accepting shared decks"
```

---

## Task 10: 集成测试

**Files:**
- 无需修改文件，运行测试验证功能

- [ ] **Step 1: 启动服务器**

```bash
cd /workspace/memory-cards/server && npm run dev
```

- [ ] **Step 2: 启动前端**

```bash
cd /workspace/memory-cards/client && npm run dev
```

- [ ] **Step 3: 测试流程**

1. 登录后创建一个卡片组
2. 进入卡片组详情页
3. 点击分享按钮
4. 开启公开分享
5. 生成私密邀请码
6. 访问社区广场页面
7. 验证卡片组显示
8. 点击导入功能
9. 验证导入成功并跳转到新卡片组

- [ ] **Step 4: 提交最终代码**

```bash
git add -A
git commit -m "feat: complete Phase 2 sharing functionality

- Add public and private deck sharing
- Implement community square with browsing and search
- Add deck import via invite code
- Include share settings modal and import page"
```

---

## 总结

完成以上 10 个任务后，Phase 2 的分享功能将全部实现：

| 功能 | 状态 |
|------|------|
| 公开分享（社区广场展示） | ✅ |
| 私密分享（邀请码） | ✅ |
| 导入功能（复制到账户） | ✅ |
| 社区浏览（最新/最热排序） | ✅ |
| 搜索功能 | ✅ |

