# 记忆卡片应用 Phase 3 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现增强功能 - 浏览器推送通知、收藏功能、评论功能

**Architecture:** 基于 Phase 1 和 Phase 2 的基础架构，添加推送通知服务和评论系统。

**Tech Stack:** 与 Phase 1/2 相同，新增 web-push 库

---

## Phase 3 依赖

Phase 3 依赖 Phase 1 和 Phase 2 完成。开始 Phase 3 前，请确保：
- Phase 1 的用户认证、卡片管理、复习功能已完成
- Phase 2 的分享功能、社区广场已完成
- 数据库已包含所有 Phase 1/2 的表

---

## 项目结构变更

```
server/src/
├── services/
│   ├── pushService.ts          # 新增 - 推送服务
│   └── commentService.ts       # 新增 - 评论服务
├── controllers/
│   ├── pushController.ts        # 新增
│   └── commentController.ts    # 新增
├── routes/
│   ├── pushRoutes.ts           # 新增
│   └── commentRoutes.ts        # 新增
└── jobs/
    └── reviewReminder.ts       # 新增 - 定时任务

client/src/
├── services/
│   └── pushService.ts          # 新增 - 推送客户端
├── hooks/
│   └── usePushNotification.ts  # 新增 - 推送 Hook
└── components/
    └── comment/
        ├── CommentList.tsx     # 新增
        └── CommentInput.tsx     # 新增
```

---

## Task 1: 数据库扩展

### 添加评论和推送订阅表

**Files:**
- Modify: `server/prisma/schema.prisma`

- [ ] **Step 1: 更新 Prisma Schema**

`server/prisma/schema.prisma` 末尾添加：

```prisma
model Comment {
  id        String   @id @default(uuid())
  deckId    String   @map("deck_id")
  userId    String   @map("user_id")
  content   String
  createdAt DateTime @default(now()) @map("created_at")

  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])

  @@map("comments")
}

model PushSubscription {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  endpoint  String
  p256dh    String
  auth      String
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("push_subscriptions")
}
```

- [ ] **Step 2: 更新数据库**

```bash
cd server && npx prisma db push
```

- [ ] **Step 3: 提交代码**

```bash
cd server && git add . && git commit -m "feat: 添加评论和推送订阅表"
```

---

## Task 2: 浏览器推送通知

### 后端 - 推送服务

**Files:**
- Create: `server/src/services/pushService.ts`
- Create: `server/src/controllers/pushController.ts`
- Create: `server/src/routes/pushRoutes.ts`
- Create: `server/src/jobs/reviewReminder.ts`
- Modify: `server/package.json`
- Modify: `server/src/index.ts`

- [ ] **Step 1: 安装 web-push 依赖**

Modify `server/package.json`:
```json
{
  "dependencies": {
    "web-push": "^3.6.6"
  },
  "devDependencies": {
    "@types/web-push": "^0.5.5"
  }
}
```

- [ ] **Step 2: 创建推送服务**

`server/src/services/pushService.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';

const prisma = new PrismaClient();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'YOUR_VAPID_PRIVATE_KEY';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:example@example.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export async function subscribe(userId: string, subscription: { endpoint: string; p256dh: string; auth: string }) {
  const existing = await prisma.pushSubscription.findUnique({ where: { userId } });
  
  if (existing) {
    return prisma.pushSubscription.update({
      where: { userId },
      data: subscription,
    });
  }

  return prisma.pushSubscription.create({
    data: { userId, ...subscription },
  });
}

export async function unsubscribe(userId: string) {
  return prisma.pushSubscription.deleteMany({ where: { userId } });
}

export async function sendReviewReminder(userId: string, dueCount: number) {
  const subscription = await prisma.pushSubscription.findUnique({ where: { userId } });
  
  if (!subscription) {
    return false;
  }

  const payload = JSON.stringify({
    title: '记忆卡片 - 复习提醒',
    body: `你有 ${dueCount} 张卡片需要复习，点击开始！`,
    icon: '/icon.png',
    badge: '/badge.png',
    data: { url: '/review' },
  });

  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      payload
    );
    return true;
  } catch (error) {
    console.error('推送发送失败:', error);
    return false;
  }
}

export async function sendToAllDueUsers() {
  const now = new Date();
  
  const dueUsers = await prisma.$queryRaw`
    SELECT DISTINCT u.id, u.email, COUNT(r.id) as due_count
    FROM users u
    JOIN decks d ON d.user_id = u.id
    JOIN cards c ON c.deck_id = d.id
    LEFT JOIN review_records r ON r.card_id = c.id AND r.user_id = u.id AND r.next_review_at <= ${now}
    WHERE r.next_review_at IS NOT NULL AND r.next_review_at <= ${now}
    GROUP BY u.id, u.email
  `;

  for (const user of dueUsers as any[]) {
    await sendReviewReminder(user.id, user.due_count);
  }
}

export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY;
}
```

- [ ] **Step 3: 创建推送控制器**

`server/src/controllers/pushController.ts`:
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as pushService from '../services/pushService.js';

export async function subscribe(req: AuthRequest, res: Response) {
  try {
    const { endpoint, p256dh, auth } = req.body;
    await pushService.subscribe(req.userId!, { endpoint, p256dh, auth });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function unsubscribe(req: AuthRequest, res: Response) {
  try {
    await pushService.unsubscribe(req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getVapidKey(req: AuthRequest, res: Response) {
  res.json({ publicKey: pushService.getVapidPublicKey() });
}
```

- [ ] **Step 4: 创建推送路由**

`server/src/routes/pushRoutes.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as pushController from '../controllers/pushController.js';

const router = Router();

router.use(authMiddleware);

router.post('/subscribe', pushController.subscribe);
router.post('/unsubscribe', pushController.unsubscribe);
router.get('/vapid-key', pushController.getVapidKey);

export default router;
```

- [ ] **Step 5: 创建定时任务**

`server/src/jobs/reviewReminder.ts`:
```typescript
import { sendToAllDueUsers } from '../services/pushService.js';

export function startReminderJob() {
  setInterval(async () => {
    console.log('检查待复习用户并发送推送...');
    try {
      await sendToAllDueUsers();
    } catch (error) {
      console.error('推送任务失败:', error);
    }
  }, 60 * 60 * 1000);
}
```

- [ ] **Step 6: 注册路由和启动任务**

Modify `server/src/index.ts`:
```typescript
import pushRoutes from './routes/pushRoutes.js';
import { startReminderJob } from './jobs/reviewReminder.js';

app.use('/api/push', pushRoutes);

startReminderJob();
```

- [ ] **Step 7: 提交代码**

```bash
cd server && git add . && git commit -m "feat: 添加推送通知后端服务"
```

### 前端 - 推送客户端

**Files:**
- Create: `client/public/sw.js`
- Create: `client/src/services/pushService.ts`
- Create: `client/src/hooks/usePushNotification.ts`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: 创建 Service Worker**

`client/public/sw.js`:
```javascript
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icon.png',
    badge: data.badge || '/badge.png',
    data: data.data,
    actions: [
      { action: 'review', title: '开始复习' },
      { action: 'dismiss', title: '稍后' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'review') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/review')
    );
  }
});
```

- [ ] **Step 2: 创建推送服务**

`client/src/services/pushService.ts`:
```typescript
import api from './api';

const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY';

export async function urlBase64ToUint8Array(base64String: string): Promise<Uint8Array> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribe() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('浏览器不支持推送通知');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('未获得通知权限');
  }

  const keyRes = await api.get('/push/vapid-key');
  const publicKey = keyRes.data.publicKey;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: await urlBase64ToUint8Array(publicKey),
  });

  await api.post('/push/subscribe', subscription);
  return subscription;
}

export async function unsubscribe() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
    await api.post('/push/unsubscribe');
  }
}

export async function isSubscribed(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }
  
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
```

- [ ] **Step 3: 创建推送 Hook**

`client/src/hooks/usePushNotification.ts`:
```typescript
import { useState, useEffect } from 'react';
import { subscribe, unsubscribe, isSubscribed } from '../services/pushService';

export function usePushNotification() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const subscribed = await isSubscribed();
      setIsEnabled(subscribed);
    } catch {
      setIsEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const enable = async () => {
    setError('');
    setLoading(true);
    try {
      await subscribe();
      setIsEnabled(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const disable = async () => {
    setError('');
    try {
      await unsubscribe();
      setIsEnabled(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { isEnabled, loading, error, enable, disable };
}
```

- [ ] **Step 4: 更新设置页面**

`client/src/pages/SettingsPage.tsx`:
```typescript
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { usePushNotification } from '../hooks/usePushNotification';
import { User } from '../types';

const user = JSON.parse(localStorage.getItem('user') || '{}') as User;

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isEnabled, loading, enable, disable } = usePushNotification();

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">设置</h2>

      <div className="bg-white rounded-lg shadow divide-y">
        <div className="p-4">
          <h3 className="font-medium mb-2">个人信息</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
              {user.nickname?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user.nickname}</p>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium mb-2">通知设置</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => e.target.checked ? enable() : disable()}
              disabled={loading}
              className="w-5 h-5"
            />
            <span>开启浏览器推送提醒</span>
          </label>
          {loading && <p className="text-sm text-gray-500 mt-1">检查中...</p>}
        </div>

        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50"
          >
            退出登录
          </button>
        </div>
      </div>
    </Layout>
  );
}
```

- [ ] **Step 5: 在 index.html 中注册 Service Worker**

Modify `client/index.html`:
```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
</script>
```

- [ ] **Step 6: 提交代码**

```bash
cd client && git add . && git commit -m "feat: 添加浏览器推送通知前端"
```

---

## Task 3: 评论功能

### 后端 - 评论服务

**Files:**
- Create: `server/src/services/commentService.ts`
- Create: `server/src/controllers/commentController.ts`
- Create: `server/src/routes/commentRoutes.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: 创建评论服务**

`server/src/services/commentService.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createComment(deckId: string, userId: string, content: string) {
  const publicDeck = await prisma.publicDeck.findUnique({ where: { deckId } });
  if (!publicDeck) {
    throw new Error('卡片组未公开，无法评论');
  }

  return prisma.comment.create({
    data: { deckId, userId, content },
    include: {
      user: { select: { id: true, nickname: true, avatar: true } },
    },
  });
}

export async function getDeckComments(deckId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { deckId },
      include: {
        user: { select: { id: true, nickname: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.comment.count({ where: { deckId } }),
  ]);

  return {
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function deleteComment(commentId: string, userId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  
  if (!comment) {
    throw new Error('评论不存在');
  }

  if (comment.userId !== userId) {
    throw new Error('无权删除此评论');
  }

  return prisma.comment.delete({ where: { id: commentId } });
}
```

- [ ] **Step 2: 创建评论控制器**

`server/src/controllers/commentController.ts`:
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as commentService from '../services/commentService.js';

export async function createComment(req: AuthRequest, res: Response) {
  try {
    const { deckId, content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }
    const comment = await commentService.createComment(deckId, req.userId!, content);
    res.status(201).json(comment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getComments(req: AuthRequest, res: Response) {
  try {
    const { deckId } = req.params;
    const { page, limit } = req.query;
    const result = await commentService.getDeckComments(
      deckId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteComment(req: AuthRequest, res: Response) {
  try {
    await commentService.deleteComment(req.params.id, req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
```

- [ ] **Step 3: 创建评论路由**

`server/src/routes/commentRoutes.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as commentController from '../controllers/commentController.js';

const router = Router();

router.use(authMiddleware);

router.post('/', commentController.createComment);
router.get('/deck/:deckId', commentController.getComments);
router.delete('/:id', commentController.deleteComment);

export default router;
```

- [ ] **Step 4: 注册路由**

Modify `server/src/index.ts`:
```typescript
import commentRoutes from './routes/commentRoutes.js';

app.use('/api/comments', commentRoutes);
```

- [ ] **Step 5: 提交代码**

```bash
cd server && git add . && git commit -m "feat: 添加评论功能 API"
```

### 前端 - 评论组件

**Files:**
- Create: `client/src/components/comment/CommentList.tsx`
- Create: `client/src/components/comment/CommentInput.tsx`
- Create: `client/src/pages/DeckDetailPage.tsx` (更新)
- Create: `client/src/components/deck/DeckCard.tsx` (更新)

- [ ] **Step 1: 创建评论列表组件**

`client/src/components/comment/CommentList.tsx`:
```typescript
import { useState, useEffect } from 'react';
import api from '../../services/api';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    avatar?: string;
  };
}

interface CommentListProps {
  deckId: string;
  currentUserId: string;
}

export default function CommentList({ deckId, currentUserId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComments();
  }, [deckId, page]);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/deck/${deckId}`, { params: { page } });
      setComments(res.data.comments);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('获取评论失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error('删除评论失败', err);
    }
  };

  const handleNewComment = (comment: Comment) => {
    setComments([comment, ...comments]);
  };

  if (loading) return <div className="text-center py-4">加载中...</div>;

  return (
    <div>
      <CommentInput deckId={deckId} onSubmit={handleNewComment} />
      
      {comments.length === 0 ? (
        <p className="text-center text-gray-500 py-4">暂无评论</p>
      ) : (
        <div className="divide-y mt-4">
          {comments.map((comment) => (
            <div key={comment.id} className="py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                  {comment.user.nickname?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.user.nickname}</span>
                    <span className="text-gray-400 text-sm">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {comment.user.id === currentUserId && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-gray-700">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            上一页
          </button>
          <span className="px-3 py-1">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建评论输入组件**

`client/src/components/comment/CommentInput.tsx`:
```typescript
import { useState } from 'react';
import api from '../../services/api';

interface CommentInputProps {
  deckId: string;
  onSubmit: (comment: any) => void;
}

export default function CommentInput({ deckId, onSubmit }: CommentInputProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/comments', { deckId, content });
      setContent('');
      onSubmit(res.data);
    } catch (err) {
      console.error('发送评论失败', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的评论..."
        className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={2}
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 self-end"
      >
        {loading ? '发送中...' : '发送'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: 更新卡片组详情页添加评论**

Modify `client/src/pages/DeckDetailPage.tsx`:
添加评论区域：

```typescript
import CommentList from '../components/comment/CommentList';

export default function DeckDetailPage() {
  // ... existing code ...

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showComments, setShowComments] = useState(false);

  return (
    <Layout>
      {/* ... existing JSX ... */}

      {deck.isPublic && (
        <div className="mt-8">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-blue-500 hover:underline mb-4"
          >
            {showComments ? '收起评论' : '查看评论'}
          </button>
          
          {showComments && (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold mb-4">评论</h3>
              <CommentList deckId={deck.id} currentUserId={user.id} />
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
```

- [ ] **Step 4: 更新社区广场卡片显示评论数**

Modify `client/src/components/deck/DeckCard.tsx`:
```typescript
interface DeckCardProps {
  // ... existing props ...
  commentCount?: number; // 新增
}

// 在组件内添加评论数显示
<span>💬 {commentCount || 0}</span>
```

- [ ] **Step 5: 提交代码**

```bash
cd client && git add . && git commit -m "feat: 添加评论功能前端"
```

---

## Task 4: 收藏功能

### 更新收藏相关 API

**Files:**
- Modify: `client/src/pages/CommunityPage.tsx`

- [ ] **Step 1: 更新社区页面添加收藏按钮**

`client/src/pages/CommunityPage.tsx`:
添加收藏功能：

```typescript
const [favorites, setFavorites] = useState<string[]>([]);

useEffect(() => {
  fetchFavorites();
}, []);

const fetchFavorites = async () => {
  try {
    const res = await api.get('/community/favorites');
    setFavorites(res.data.map((f: any) => f.id));
  } catch (err) {
    console.error('获取收藏失败', err);
  }
};

const handleFavorite = async (deckId: string) => {
  try {
    await api.post('/community/favorite', { deckId });
    setFavorites(prev => 
      prev.includes(deckId) 
        ? prev.filter(id => id !== deckId)
        : [...prev, deckId]
    );
  } catch (err) {
    console.error('收藏失败', err);
  }
};
```

- [ ] **Step 2: 添加收藏按钮**

```typescript
<button
  onClick={() => handleFavorite(deck.id)}
  className={`mt-2 mr-2 text-sm ${favorites.includes(deck.id) ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'}`}
>
  {favorites.includes(deck.id) ? '★ 已收藏' : '☆ 收藏'}
</button>
```

- [ ] **Step 3: 提交代码**

```bash
cd client && git add . && git commit -m "feat: 添加收藏功能前端"
cd server && git add . && git commit -m "feat: Phase 3 完成"
```

---

## 最终集成测试

- [ ] **Step 1: 完整功能测试**

```bash
# 1. 测试推送订阅
# - 打开设置页面
# - 开启推送通知
# - 验证 Service Worker 注册

# 2. 测试评论功能
# - 访问公开卡片组详情
# - 发表评论
# - 删除评论

# 3. 测试收藏功能
# - 在社区广场收藏卡片组
# - 验证收藏状态
```

- [ ] **Step 2: 提交最终代码**

```bash
cd server && git add . && git commit -m "feat: Phase 3 完成 - 推送通知、评论、收藏"
cd client && git add . && git commit -m "feat: Phase 3 完成 - 推送通知、评论、收藏"
```

---

## Phase 3 总结

完成后的功能：
- ✅ Service Worker 配置
- ✅ Web Push API 集成
- ✅ 用户可开启/关闭推送通知
- ✅ 定时发送复习提醒推送
- ✅ 评论功能（发表、查看、删除）
- ✅ 收藏功能
- ✅ 所有 Phase 1/2 功能

---

## 完整项目总结

三个 Phase 完成后，应用包含：

**Phase 1 - 核心功能：**
- 用户注册登录
- 卡片组管理
- 卡片管理（四种类型）
- 艾宾浩斯复习算法
- Dashboard 统计

**Phase 2 - 分享功能：**
- 公开分享
- 私密分享（链接）
- 社区广场
- 导入功能
- 点赞功能

**Phase 3 - 增强功能：**
- 浏览器推送通知
- 评论功能
- 收藏功能
