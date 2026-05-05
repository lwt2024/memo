# 卡片标签功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现卡片标签功能，支持用户为卡片添加1-3个标签，在卡片列表显示标签，并支持按标签筛选。

**Architecture:** 
- 数据库：新增 Tag 和 CardTag 模型，更新 Card 模型
- 后端：新增标签管理 API，更新卡片 API 支持标签
- 前端：新增标签组件，更新卡片编辑和列表页面

**Tech Stack:** React, TypeScript, Prisma, SQLite, Express

---

## 文件结构

### 新建文件
- `memory-cards/server/src/controllers/tagController.ts` - 标签控制器
- `memory-cards/server/src/services/tagService.ts` - 标签服务
- `memory-cards/server/src/routes/tagRoutes.ts` - 标签路由
- `memory-cards/client/src/components/common/TagSelector.tsx` - 标签选择组件
- `memory-cards/client/src/components/common/TagDisplay.tsx` - 标签显示组件
- `memory-cards/client/src/components/common/TagFilter.tsx` - 标签筛选组件

### 修改文件
- `memory-cards/server/prisma/schema.prisma` - 更新数据模型
- `memory-cards/server/src/routes/index.ts` - 注册标签路由
- `memory-cards/server/src/controllers/cardController.ts` - 更新卡片控制器
- `memory-cards/server/src/services/cardService.ts` - 更新卡片服务
- `memory-cards/client/src/types/index.ts` - 更新类型定义
- `memory-cards/client/src/pages/DeckDetailPage.tsx` - 添加标签功能
- `memory-cards/client/src/services/api.ts` - 添加标签 API 调用

---

## 预设标签颜色
- 重要: #ef4444
- 待复习: #f97316
- 重点: #3b82f6
- 易错: #8b5cf6
- 已掌握: #22c55e
- 拓展: #06b6d4
- 基础: #eab308
- 进阶: #ec4899

---

## Task 1: 更新数据库模型和迁移

**Files:**
- Modify: `memory-cards/server/prisma/schema.prisma`

- [ ] **Step 1: 更新 Prisma Schema**

```prisma
model Tag {
  id        String   @id @default(uuid())
  name      String
  color     String
  userId    String   @map("user_id")
  isPreset  Boolean  @default(false) @map("is_preset")
  createdAt DateTime @default(now()) @map("created_at")

  user     User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  cardTags CardTag[]

  @@map("tags")
  @@unique([userId, name])
}

model CardTag {
  id      String @id @default(uuid())
  cardId  String @map("card_id")
  tagId   String @map("tag_id")
  userId  String @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("card_tags")
  @@unique([cardId, tagId])
}

model Card {
  id        String   @id @default(uuid())
  deckId    String   @map("deck_id")
  front     String
  back      String
  cardType  String   @default("text") @map("card_type")
  mediaUrls String?  @map("media_urls")
  createdAt DateTime @default(now()) @map("created_at")

  deck          Deck           @relation(fields: [deckId], references: [id], onDelete: Cascade)
  reviewRecords ReviewRecord[]
  cardTags      CardTag[]

  @@map("cards")
}
```

- [ ] **Step 2: 运行数据库迁移**

```bash
cd memory-cards/server
npx prisma db push
```

- [ ] **Step 3: 验证迁移**

确认数据库中新增了 tags 和 card_tags 表。

---

## Task 2: 后端 - 标签服务

**Files:**
- Create: `memory-cards/server/src/services/tagService.ts`

- [ ] **Step 1: 创建标签服务**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 预设标签数据
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
  for (const tagData of PRESET_TAGS) {
    const existing = await prisma.tag.findFirst({
      where: {
        userId,
        name: tagData.name,
        isPreset: true,
      },
    });
    
    if (!existing) {
      await prisma.tag.create({
        data: {
          ...tagData,
          userId,
          isPreset: true,
        },
      });
    }
  }
}

export async function getUserTags(userId: string) {
  await ensurePresetTags(userId);
  
  return prisma.tag.findMany({
    where: { userId },
    orderBy: [{ isPreset: 'desc' }, { createdAt: 'asc' }],
  });
}

export async function createTag(userId: string, name: string, color: string) {
  if (name.length < 2 || name.length > 20) {
    throw new Error('标签名称需要2-20个字符');
  }

  const existing = await prisma.tag.findFirst({
    where: { userId, name },
  });

  if (existing) {
    throw new Error('标签已存在');
  }

  return prisma.tag.create({
    data: {
      name,
      color,
      userId,
      isPreset: false,
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
    throw new Error('卡片组不存在');
  }

  const tagCount: Map<string, { tag: any; count: number }> = new Map();

  for (const card of deck.cards) {
    for (const cardTag of card.cardTags) {
      const tagId = cardTag.tagId;
      if (!tagCount.has(tagId)) {
        tagCount.set(tagId, { tag: cardTag.tag, count: 0 });
      }
      const entry = tagCount.get(tagId)!;
      entry.count++;
    }
  }

  return Array.from(tagCount.values()).map(({ tag, count }) => ({
    ...tag,
    count,
  }));
}

export async function addTagToCard(cardId: string, tagId: string, userId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: { cardTags: true },
  });

  if (!card) {
    throw new Error('卡片不存在');
  }

  if (card.deckId && card.deckId) {
    const deck = await prisma.deck.findUnique({
      where: { id: card.deckId },
    });
    if (deck?.userId !== userId) {
      throw new Error('没有权限');
    }
  }

  if (card.cardTags.length >= 3) {
    throw new Error('每张卡片最多添加3个标签');
  }

  const existing = await prisma.cardTag.findFirst({
    where: { cardId, tagId },
  });

  if (existing) {
    throw new Error('标签已添加到该卡片');
  }

  return prisma.cardTag.create({
    data: {
      cardId,
      tagId,
      userId,
    },
    include: { tag: true },
  });
}

export async function removeTagFromCard(cardId: string, tagId: string, userId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
  });

  if (!card) {
    throw new Error('卡片不存在');
  }

  if (card.deckId) {
    const deck = await prisma.deck.findUnique({
      where: { id: card.deckId },
    });
    if (deck?.userId !== userId) {
      throw new Error('没有权限');
    }
  }

  return prisma.cardTag.deleteMany({
    where: {
      cardId,
      tagId,
      userId,
    },
  });
}
```

---

## Task 3: 后端 - 标签控制器

**Files:**
- Create: `memory-cards/server/src/controllers/tagController.ts`

- [ ] **Step 1: 创建标签控制器**

```typescript
import { Request, Response } from 'express';
import { getUserTags, createTag, getDeckTags, addTagToCard, removeTagFromCard } from '../services/tagService.js';

interface AuthRequest extends Request {
  userId?: string;
}

export async function getUserTagsHandler(req: AuthRequest, res: Response) {
  try {
    const tags = await getUserTags(req.userId!);
    res.json({ tags });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function createTagHandler(req: AuthRequest, res: Response) {
  try {
    const { name, color } = req.body;
    const tag = await createTag(req.userId!, name, color);
    res.status(201).json({ tag });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getDeckTagsHandler(req: AuthRequest, res: Response) {
  try {
    const { deckId } = req.params;
    const tags = await getDeckTags(deckId);
    res.json({ tags });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function addTagToCardHandler(req: AuthRequest, res: Response) {
  try {
    const { cardId, tagId } = req.body;
    const cardTag = await addTagToCard(cardId, tagId, req.userId!);
    res.status(201).json({ cardTag });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function removeTagFromCardHandler(req: AuthRequest, res: Response) {
  try {
    const { cardId, tagId } = req.params;
    await removeTagFromCard(cardId, tagId, req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
```

---

## Task 4: 后端 - 标签路由

**Files:**
- Create: `memory-cards/server/src/routes/tagRoutes.ts`

- [ ] **Step 1: 创建标签路由**

```typescript
import { Router } from 'express';
import { 
  getUserTagsHandler, 
  createTagHandler, 
  getDeckTagsHandler, 
  addTagToCardHandler, 
  removeTagFromCardHandler 
} from '../controllers/tagController.js';

const router = Router();

router.get('/', getUserTagsHandler);
router.post('/', createTagHandler);
router.get('/deck/:deckId', getDeckTagsHandler);
router.post('/card-tags', addTagToCardHandler);
router.delete('/card-tags/:cardId/:tagId', removeTagFromCardHandler);

export default router;
```

---

## Task 5: 后端 - 注册标签路由

**Files:**
- Modify: `memory-cards/server/src/routes/index.ts`

- [ ] **Step 1: 更新路由文件**

```typescript
import { Router } from 'express';
import authRoutes from './authRoutes.js';
import deckRoutes from './deckRoutes.js';
import cardRoutes from './cardRoutes.js';
import userRoutes from './userRoutes.js';
import tagRoutes from './tagRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/decks', deckRoutes);
router.use('/cards', cardRoutes);
router.use('/user', userRoutes);
router.use('/tags', tagRoutes);

export default router;
```

---

## Task 6: 后端 - 更新卡片服务以包含标签

**Files:**
- Modify: `memory-cards/server/src/services/cardService.ts`
- (如果不存在，检查现有结构并相应更新)

- [ ] **Step 1: 更新 getDeck 函数，包含标签**

在返回卡片时，确保包含 cardTags 和 tag 数据：

```typescript
// 在 getDeck 或 getCards 相关的查询中
include: {
  cards: {
    include: {
      cardTags: {
        include: { tag: true },
      },
      reviewRecord: {
        where: { userId }
      }
    },
  },
}
```

---

## Task 7: 前端 - 更新类型定义

**Files:**
- Modify: `memory-cards/client/src/types/index.ts`

- [ ] **Step 1: 添加标签相关类型**

```typescript
export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  isPreset: boolean;
  createdAt: string;
  count?: number; // 用于筛选时显示数量
}

export interface CardTag {
  id: string;
  cardId: string;
  tagId: string;
  userId: string;
  createdAt: string;
  tag: Tag;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  cardType: string;
  mediaUrls?: string;
  createdAt: string;
  cardTags?: CardTag[];
  reviewRecord?: ReviewRecord;
}
```

---

## Task 8: 前端 - 更新 API 服务

**Files:**
- Modify: `memory-cards/client/src/services/api.ts`

- [ ] **Step 1: 添加标签 API 调用**

```typescript
export const tagApi = {
  getUserTags: () => api.get('/tags'),
  createTag: (name: string, color: string) => api.post('/tags', { name, color }),
  getDeckTags: (deckId: string) => api.get(`/tags/deck/${deckId}`),
  addTagToCard: (cardId: string, tagId: string) => api.post('/tags/card-tags', { cardId, tagId }),
  removeTagFromCard: (cardId: string, tagId: string) => api.delete(`/tags/card-tags/${cardId}/${tagId}`),
};
```

---

## Task 9: 前端 - 创建 TagDisplay 组件

**Files:**
- Create: `memory-cards/client/src/components/common/TagDisplay.tsx`

- [ ] **Step 1: 创建标签显示组件**

```typescript
import { Tag } from '../../types';

interface TagDisplayProps {
  tags: Tag[];
  maxTags?: number;
  showCount?: boolean;
  size?: 'sm' | 'md';
}

export default function TagDisplay({ tags, maxTags = 3, showCount = false, size = 'md' }: TagDisplayProps) {
  const displayTags = tags.slice(0, maxTags);
  const extraCount = tags.length - maxTags;

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
  };

  return (
    <div className="flex flex-wrap gap-1">
      {displayTags.map(tag => (
        <span
          key={tag.id}
          className={`${sizeClasses[size]} rounded-full font-medium text-white select-none`}
          style={{ backgroundColor: tag.color }}
        >
          {tag.name}
          {showCount && tag.count && `(${tag.count})`}
        </span>
      ))}
      {extraCount > 0 && (
        <span className={`${sizeClasses[size]} rounded-full font-medium text-white`} style={{ backgroundColor: '#64748b' }}>
          +{extraCount}
        </span>
      )}
    </div>
  );
}
```

---

## Task 10: 前端 - 创建 TagSelector 组件

**Files:**
- Create: `memory-cards/client/src/components/common/TagSelector.tsx`

- [ ] **Step 1: 创建标签选择组件**

```typescript
import { useState, useEffect } from 'react';
import { Tag } from '../../types';
import { tagApi } from '../../services/api';

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  error?: string;
}

const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

export default function TagSelector({ selectedTagIds, onChange, error }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLOR_OPTIONS[0]);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const res = await tagApi.getUserTags();
      setTags(res.data.tags);
    } catch (error) {
      console.error('加载标签失败', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else if (selectedTagIds.length < 3) {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const createTag = async () => {
    setCreateError('');
    try {
      const res = await tagApi.createTag(newTagName, newTagColor);
      setTags([...tags, res.data.tag]);
      setShowCreateModal(false);
      setNewTagName('');
    } catch (error: any) {
      setCreateError(error.response?.data?.error || '创建标签失败');
    }
  };

  if (loading) return <div style={{ color: 'var(--color-text-secondary)' }}>加载中...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          标签
        </label>
        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          已选 {selectedTagIds.length}/3
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map(tag => {
          const isSelected = selectedTagIds.includes(tag.id);
          const canSelect = isSelected || selectedTagIds.length < 3;
          
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => canSelect && toggleTag(tag.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                isSelected ? 'ring-2 ring-offset-1' : ''
              } ${!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                backgroundColor: isSelected ? tag.color : 'transparent',
                color: isSelected ? 'white' : tag.color,
                border: `2px solid ${tag.color}`,
                ringColor: tag.color,
              }}
            >
              {tag.name}
            </button>
          );
        })}
        
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1 rounded-full text-sm font-medium border-2 border-dashed transition-all hover:border-[var(--color-primary)]"
          style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}
        >
          + 新建标签
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: 'var(--color-card)' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              新建标签
            </h3>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                标签名称
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full px-3 py-2 rounded border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)',
                }}
                placeholder="输入标签名称（2-20字符）"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                标签颜色
              </label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newTagColor === color ? 'ring-2 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color, ringColor: color }}
                  />
                ))}
              </div>
            </div>

            {createError && (
              <div className="mb-4 text-sm text-red-500">{createError}</div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError('');
                  setNewTagName('');
                }}
                className="px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={createTag}
                className="px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: newTagColor }}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Task 11: 前端 - 创建 TagFilter 组件

**Files:**
- Create: `memory-cards/client/src/components/common/TagFilter.tsx`

- [ ] **Step 1: 创建标签筛选组件**

```typescript
import { Tag } from '../../types';

interface TagFilterProps {
  tags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export default function TagFilter({ tags, selectedTagIds, onChange }: TagFilterProps) {
  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
        标签:
      </span>
      
      <button
        type="button"
        onClick={clearAll}
        className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
          selectedTagIds.length === 0 ? 'ring-2' : ''
        }`}
        style={{
          backgroundColor: selectedTagIds.length === 0 ? 'var(--color-primary)' : 'var(--color-background)',
          color: selectedTagIds.length === 0 ? 'white' : 'var(--color-text)',
          border: '1px solid var(--color-border)',
        }}
      >
        全部
      </button>

      {tags.map(tag => {
        const isSelected = selectedTagIds.includes(tag.id);
        
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
              isSelected ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: isSelected ? tag.color : 'var(--color-background)',
              color: isSelected ? 'white' : tag.color,
              border: `1px solid ${tag.color}`,
            }}
          >
            {tag.name}
            {tag.count && `(${tag.count})`}
          </button>
        );
      })}
    </div>
  );
}
```

---

## Task 12: 前端 - 更新 DeckDetailPage

**Files:**
- Modify: `memory-cards/client/src/pages/DeckDetailPage.tsx`

- [ ] **Step 1: 添加标签相关状态**

```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { tagApi } from '../services/api';
import { Card, Tag as TagType } from '../types';
import Layout from '../components/common/Layout';
import TagSelector from '../components/common/TagSelector';
import TagDisplay from '../components/common/TagDisplay';
import TagFilter from '../components/common/TagFilter';

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'createdAt' | 'masteryLevel'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [masteryFilter, setMasteryFilter] = useState<number | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [deckTags, setDeckTags] = useState<TagType[]>([]);
  const [tagError, setTagError] = useState('');
```

- [ ] **Step 2: 添加加载标签的逻辑**

```typescript
  useEffect(() => {
    if (id) {
      fetchDeckData();
      fetchDeckTags();
    }
  }, [id, sortBy, sortOrder, masteryFilter]);

  const fetchDeckTags = async () => {
    try {
      const res = await tagApi.getDeckTags(id!);
      setDeckTags(res.data.tags);
    } catch (error) {
      console.error('加载标签失败', error);
    }
  };
```

- [ ] **Step 3: 添加标签过滤逻辑**

```typescript
  const filteredCards = deck?.cards?.filter((card: Card) => {
    if (!searchQuery) {
    } else {
      const query = searchQuery.toLowerCase();
      if (!(card.front.toLowerCase().includes(query) ||
        card.back.toLowerCase().includes(query))) {
        return false;
      }
    }
    
    if (tagFilter.length > 0) {
      const cardTagIds = card.cardTags?.map(ct => ct.tagId) || [];
      const hasAllTags = tagFilter.every(tagId => cardTagIds.includes(tagId));
      if (!hasAllTags) return false;
    }
    
    return true;
  });
```

- [ ] **Step 4: 更新保存卡片逻辑**

```typescript
  const saveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagError('');
    
    try {
      let cardId: string;
      
      if (editingCard) {
        await api.put(`/cards/${editingCard.id}`, { front: cardFront, back: cardBack });
        cardId = editingCard.id;
        
        // 移除现有标签
        const existingTagIds = editingCard.cardTags?.map(ct => ct.tagId) || [];
        for (const tagId of existingTagIds) {
          try {
            await tagApi.removeTagFromCard(cardId, tagId);
          } catch {}
        }
      } else {
        const res = await api.post('/cards', { deckId: id, front: cardFront, back: cardBack });
        cardId = res.data.card.id;
      }
      
      // 添加新标签
      for (const tagId of selectedTagIds) {
        try {
          await tagApi.addTagToCard(cardId, tagId);
        } catch (error: any) {
          setTagError(error.response?.data?.error || '添加标签失败');
        }
      }
      
      setShowModal(false);
      fetchDeckData();
      fetchDeckTags();
    } catch (error) {
      console.error('保存卡片失败', error);
    }
  };
```

- [ ] **Step 5: 更新打开编辑模态框逻辑**

```typescript
  const openEditModal = (card: Card) => {
    setEditingCard(card);
    setCardFront(card.front);
    setCardBack(card.back);
    setSelectedTagIds(card.cardTags?.map(ct => ct.tagId) || []);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setCardFront('');
    setCardBack('');
    setSelectedTagIds([]);
    setShowModal(true);
  };
```

- [ ] **Step 6: 更新筛选栏**

```typescript
      {/* 搜索、筛选和排序 */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="flex gap-2 items-center">
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>搜索:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索卡片内容..."
                className="flex-1 px-3 py-2 rounded border"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 py-2 rounded border hover:bg-gray-100"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* 排序和筛选 */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2 items-center">
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>排序:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded border"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              >
                <option value="createdAt">创建时间</option>
                <option value="masteryLevel">掌握程度</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-2 rounded border hover:bg-gray-100"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
            
            <div className="flex gap-2 items-center">
              <span className="font-medium" style={{ color: 'var(--color-text)' }}>掌握程度:</span>
              <select
                value={masteryFilter}
                onChange={(e) => setMasteryFilter(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="px-3 py-2 rounded border"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              >
                <option value="">全部</option>
                <option value="0">未学习</option>
                <option value="1">初识</option>
                <option value="2">熟悉</option>
                <option value="3">掌握</option>
                <option value="4">熟练</option>
                <option value="5">精通</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* 标签筛选 */}
        <div className="mt-4">
          <TagFilter
            tags={deckTags}
            selectedTagIds={tagFilter}
            onChange={setTagFilter}
          />
        </div>
        
        {/* 搜索结果计数 */}
        {searchQuery && filteredCards && (
          <div className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            找到 {filteredCards.length} 张卡片
          </div>
        )}
      </div>
```

- [ ] **Step 7: 更新卡片列表显示标签**

```typescript
                      {/* 卡片元数据 */}
                      <div className="flex flex-wrap gap-2 mt-2 items-center">
                        {/* 标签显示 */}
                        {card.cardTags && card.cardTags.length > 0 && (
                          <TagDisplay
                            tags={card.cardTags.map(ct => ct.tag)}
                            size="sm"
                          />
                        )}
                        
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          📅 {formatDate(card.createdAt)}
                        </span>
                        <span style={{ color: 'var(--color-text-secondary)' }}>
                          🔄 复习 {card.reviewRecord?.reviewCount || 0} 次
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: getMasteryLevelColor(card.reviewRecord?.masteryLevel || 0),
                            color: 'white'
                          }}
                        >
                          {getMasteryLabel(card.reviewRecord?.masteryLevel || 0)}
                        </span>
                      </div>
```

- [ ] **Step 8: 更新卡片编辑模态框**

```typescript
              <div className="mb-6">
                <TagSelector
                  selectedTagIds={selectedTagIds}
                  onChange={setSelectedTagIds}
                  error={tagError}
                />
              </div>
```

---

## Task 13: 测试

**Files:**
- 需要手动测试功能

- [ ] **Step 1: 测试标签创建**
- [ ] **Step 2: 测试为卡片添加标签**
- [ ] **Step 3: 测试卡片列表显示标签**
- [ ] **Step 4: 测试标签筛选功能**
- [ ] **Step 5: 测试编辑卡片的标签**

---

## 计划完成！

> **Plan complete and saved to `docs/superpowers/plans/2026-05-05-card-tags-implementation.md`. Two execution options:**

> **1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

> **2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

> **Which approach?**

