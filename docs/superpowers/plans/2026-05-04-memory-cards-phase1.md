# 记忆卡片应用 Phase 1 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现核心功能 - 用户认证、卡片管理、艾宾浩斯复习算法、应用内提醒

**Architecture:** 前后端分离架构，前端 React + 后端 Express + PostgreSQL。Phase 1 完成后，用户可以注册登录、创建卡片组和卡片、按艾宾浩斯曲线复习。

**Tech Stack:**
- 前端: React 18, TypeScript, Tailwind CSS, React Router, Axios
- 后端: Node.js, Express, TypeScript, PostgreSQL, Redis, JWT
- 开发工具: Vite (前端), ts-node (后端)

---

## 项目结构

```
memory-cards/
├── client/                    # 前端项目
│   ├── src/
│   │   ├── components/       # React 组件
│   │   │   ├── common/       # 通用组件 (Button, Input, Card 等)
│   │   │   ├── auth/         # 认证相关组件
│   │   │   ├── deck/         # 卡片组相关组件
│   │   │   ├── card/         # 卡片相关组件
│   │   │   └── review/       # 复习相关组件
│   │   ├── pages/            # 页面组件
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DecksPage.tsx
│   │   │   ├── DeckDetailPage.tsx
│   │   │   ├── ReviewPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── services/         # API 服务
│   │   ├── stores/           # 状态管理
│   │   ├── types/            # TypeScript 类型定义
│   │   ├── utils/            # 工具函数
│   │   └── App.tsx
│   └── package.json
├── server/                    # 后端项目
│   ├── src/
│   │   ├── controllers/      # 控制器
│   │   ├── services/         # 业务逻辑
│   │   ├── models/           # 数据模型
│   │   ├── routes/           # 路由
│   │   ├── middlewares/      # 中间件
│   │   ├── utils/            # 工具函数
│   │   ├── config/           # 配置文件
│   │   └── index.ts
│   ├── prisma/               # Prisma ORM
│   │   └── schema.prisma
│   └── package.json
└── README.md
```

---

## Task 1: 项目初始化

### 前端项目搭建

**Files:**
- Create: `client/package.json`
- Create: `client/vite.config.ts`
- Create: `client/tsconfig.json`
- Create: `client/tailwind.config.js`
- Create: `client/index.html`

- [ ] **Step 1: 创建前端项目配置文件**

`client/package.json`:
```json
{
  "name": "memory-cards-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: 运行命令初始化项目**

```bash
cd client && npm install
```

- [ ] **Step 3: 提交代码**

```bash
cd client && git init && git add . && git commit -m "feat: 初始化前端项目"
```

### 后端项目搭建

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/prisma/schema.prisma`

- [ ] **Step 1: 创建后端项目配置文件**

`server/package.json`:
```json
{
  "name": "memory-cards-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:push": "prisma db push",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "redis": "^4.6.10"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.0",
    "prisma": "^5.7.0",
    "tsx": "^4.6.0",
    "typescript": "^5.3.0"
  }
}
```

`server/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  nickname     String?
  avatar       String?
  createdAt    DateTime @default(now()) @map("created_at")

  decks         Deck[]
  reviewRecords ReviewRecord[]

  @@map("users")
}

model Deck {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  name        String
  description String?
  isPublic    Boolean  @default(false) @map("is_public")
  createdAt   DateTime @default(now()) @map("created_at")

  user  User   @relation(fields: [userId], references: [id])
  cards Card[]

  @@map("decks")
}

model Card {
  id        String   @id @default(uuid())
  deckId    String   @map("deck_id")
  front     String
  back      String
  cardType  String   @default("text") @map("card_type")
  mediaUrls Json?    @map("media_urls")
  createdAt DateTime @default(now()) @map("created_at")

  deck         Deck           @relation(fields: [deckId], references: [id], onDelete: Cascade)
  reviewRecords ReviewRecord[]

  @@map("cards")
}

model ReviewRecord {
  id            String    @id @default(uuid())
  cardId        String    @map("card_id")
  userId        String    @map("user_id")
  easeLevel     Int       @default(3) @map("ease_level")
  nextReviewAt  DateTime? @map("next_review_at")
  lastReviewAt  DateTime? @map("last_review_at")
  reviewCount   Int       @default(0) @map("review_count")
  createdAt     DateTime  @default(now()) @map("created_at")

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id])

  @@unique([cardId, userId])
  @@map("review_records")
}
```

- [ ] **Step 2: 运行命令初始化项目**

```bash
cd server && npm install && npx prisma generate
```

- [ ] **Step 3: 配置环境变量**

Create `server/.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/memory_cards?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
```

- [ ] **Step 4: 提交代码**

```bash
cd server && git init && git add . && git commit -m "feat: 初始化后端项目"
```

---

## Task 2: 用户认证模块

### 后端 - 用户认证 API

**Files:**
- Create: `server/src/controllers/authController.ts`
- Create: `server/src/services/authService.ts`
- Create: `server/src/routes/authRoutes.ts`
- Create: `server/src/middlewares/auth.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: 创建认证中间件**

`server/src/middlewares/auth.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Token 无效' });
  }
}
```

- [ ] **Step 2: 创建认证服务**

`server/src/services/authService.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function register(email: string, password: string, nickname?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('邮箱已被注册');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      nickname: nickname || email.split('@')[0],
    },
  });

  const token = generateToken(user.id);
  return { user: { id: user.id, email: user.email, nickname: user.nickname }, token };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('邮箱或密码错误');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error('邮箱或密码错误');
  }

  const token = generateToken(user.id);
  return { user: { id: user.id, email: user.email, nickname: user.nickname }, token };
}

function generateToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
}
```

- [ ] **Step 3: 创建认证控制器**

`server/src/controllers/authController.ts`:
```typescript
import { Request, Response } from 'express';
import { register, login } from '../services/authService.js';

export async function registerHandler(req: Request, res: Response) {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }
    const result = await register(email, password, nickname);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }
    const result = await login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}
```

- [ ] **Step 4: 创建认证路由**

`server/src/routes/authRoutes.ts`:
```typescript
import { Router } from 'express';
import { registerHandler, loginHandler } from '../controllers/authController.js';

const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router;
```

- [ ] **Step 5: 在入口文件中注册路由**

`server/src/index.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 6: 启动后端测试 API**

```bash
cd server && npm run dev
```

Expected: Server running on port 3001

- [ ] **Step 7: 测试注册和登录 API**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","nickname":"测试用户"}'
```

Expected: 返回用户信息和 token

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected: 返回用户信息和 token

- [ ] **Step 8: 提交代码**

```bash
cd server && git add . && git commit -m "feat: 添加用户认证 API"
```

### 前端 - 用户认证页面

**Files:**
- Create: `client/src/types/index.ts`
- Create: `client/src/services/api.ts`
- Create: `client/src/pages/LoginPage.tsx`
- Create: `client/src/pages/RegisterPage.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: 创建类型定义**

`client/src/types/index.ts`:
```typescript
export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Deck {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  cardCount?: number;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  cardType: 'text' | 'rich_text' | 'image' | 'audio';
  mediaUrls?: string[];
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  cardId: string;
  userId: string;
  easeLevel: number;
  nextReviewAt?: string;
  lastReviewAt?: string;
  reviewCount: number;
}
```

- [ ] **Step 2: 创建 API 服务**

`client/src/services/api.ts`:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (email: string, password: string, nickname?: string) =>
    api.post('/auth/register', { email, password, nickname }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

export default api;
```

- [ ] **Step 3: 创建登录页面**

`client/src/pages/LoginPage.tsx`:
```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">登录</h1>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          还没有账号? <Link to="/register" className="text-blue-500">注册</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 创建注册页面**

`client/src/pages/RegisterPage.tsx`:
```typescript
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register(email, password, nickname);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">注册</h1>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          已有账号? <Link to="/login" className="text-blue-500">登录</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 配置路由**

`client/src/App.tsx`:
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 6: 运行前端测试**

```bash
cd client && npm run dev
```

- [ ] **Step 7: 提交代码**

```bash
cd client && git add . && git commit -m "feat: 添加登录注册页面"
```

---

## Task 3: 卡片组管理模块

### 后端 - 卡片组 API

**Files:**
- Create: `server/src/controllers/deckController.ts`
- Create: `server/src/services/deckService.ts`
- Create: `server/src/routes/deckRoutes.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: 创建卡片组服务**

`server/src/services/deckService.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createDeck(userId: string, name: string, description?: string) {
  return prisma.deck.create({
    data: { userId, name, description },
  });
}

export async function getUserDecks(userId: string) {
  return prisma.deck.findMany({
    where: { userId },
    include: {
      _count: { select: { cards: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDeckById(deckId: string, userId: string) {
  return prisma.deck.findFirst({
    where: { id: deckId, userId },
    include: {
      cards: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function updateDeck(deckId: string, userId: string, data: { name?: string; description?: string }) {
  return prisma.deck.updateMany({
    where: { id: deckId, userId },
    data,
  });
}

export async function deleteDeck(deckId: string, userId: string) {
  return prisma.deck.deleteMany({
    where: { id: deckId, userId },
  });
}
```

- [ ] **Step 2: 创建卡片组控制器**

`server/src/controllers/deckController.ts`:
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as deckService from '../services/deckService.js';

export async function createDeck(req: AuthRequest, res: Response) {
  try {
    const { name, description } = req.body;
    const deck = await deckService.createDeck(req.userId!, name, description);
    res.status(201).json(deck);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getDecks(req: AuthRequest, res: Response) {
  try {
    const decks = await deckService.getUserDecks(req.userId!);
    res.json(decks);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getDeck(req: AuthRequest, res: Response) {
  try {
    const deck = await deckService.getDeckById(req.params.id, req.userId!);
    if (!deck) {
      return res.status(404).json({ error: '卡片组不存在' });
    }
    res.json(deck);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateDeck(req: AuthRequest, res: Response) {
  try {
    const { name, description } = req.body;
    const result = await deckService.updateDeck(req.params.id, req.userId!, { name, description });
    if (result.count === 0) {
      return res.status(404).json({ error: '卡片组不存在' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteDeck(req: AuthRequest, res: Response) {
  try {
    const result = await deckService.deleteDeck(req.params.id, req.userId!);
    if (result.count === 0) {
      return res.status(404).json({ error: '卡片组不存在' });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
```

- [ ] **Step 3: 创建卡片组路由**

`server/src/routes/deckRoutes.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as deckController from '../controllers/deckController.js';

const router = Router();

router.use(authMiddleware);

router.post('/', deckController.createDeck);
router.get('/', deckController.getDecks);
router.get('/:id', deckController.getDeck);
router.put('/:id', deckController.updateDeck);
router.delete('/:id', deckController.deleteDeck);

export default router;
```

- [ ] **Step 4: 注册路由**

Modify `server/src/index.ts`:
```typescript
import deckRoutes from './routes/deckRoutes.js';

app.use('/api/decks', deckRoutes);
```

- [ ] **Step 5: 测试 API**

```bash
# 获取所有卡片组
curl http://localhost:3001/api/decks \
  -H "Authorization: Bearer YOUR_TOKEN"

# 创建卡片组
curl -X POST http://localhost:3001/api/decks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"英语单词","description":"日常英语词汇"}'
```

- [ ] **Step 6: 提交代码**

```bash
cd server && git add . && git commit -m "feat: 添加卡片组 CRUD API"
```

### 前端 - 卡片组页面

**Files:**
- Create: `client/src/pages/DecksPage.tsx`
- Create: `client/src/components/common/Layout.tsx`
- Create: `client/src/components/common/Sidebar.tsx`
- Create: `client/src/components/common/BottomNav.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: 创建 Layout 组件**

`client/src/components/common/Layout.tsx`:
```typescript
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
```

`client/src/components/common/Sidebar.tsx`:
```typescript
import { Link, useLocation } from 'react-router-dom';
import { User } from '../../types';

const user = JSON.parse(localStorage.getItem('user') || '{}') as User;

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/decks', label: '我的卡片组', icon: '📚' },
    { path: '/community', label: '社区广场', icon: '🌐' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ];

  return (
    <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white shadow-md">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">记忆卡片</h1>
      </div>
      <nav className="p-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
            {user.nickname?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user.nickname}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

`client/src/components/common/BottomNav.tsx`:
```typescript
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/decks', label: '卡片组', icon: '📚' },
    { path: '/community', label: '社区', icon: '🌐' },
    { path: '/settings', label: '设置', icon: '⚙️' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center py-2 px-4 ${
            location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: 创建 DecksPage**

`client/src/pages/DecksPage.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { authApi } from '../services/api';
import { Deck } from '../types';
import Layout from '../components/common/Layout';

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const res = await api.get('/decks');
      setDecks(res.data);
    } catch (err) {
      console.error('获取卡片组失败', err);
    } finally {
      setLoading(false);
    }
  };

  const createDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/decks', { name: newDeckName, description: newDeckDesc });
      setShowModal(false);
      setNewDeckName('');
      setNewDeckDesc('');
      fetchDecks();
    } catch (err) {
      console.error('创建卡片组失败', err);
    }
  };

  const deleteDeck = async (deckId: string) => {
    if (!confirm('确定要删除这个卡片组吗？')) return;
    try {
      await api.delete(`/decks/${deckId}`);
      fetchDecks();
    } catch (err) {
      console.error('删除卡片组失败', err);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">我的卡片组</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          + 新建卡片组
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">加载中...</div>
      ) : decks.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="text-4xl mb-4">📚</p>
          <p>还没有卡片组，创建一个开始学习吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <div key={deck.id} className="bg-white rounded-lg shadow p-4">
              <Link to={`/decks/${deck.id}`}>
                <h3 className="font-bold text-lg mb-2">{deck.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{deck.description || '暂无描述'}</p>
                <p className="text-blue-500 text-sm">{deck._count?.cards || 0} 张卡片</p>
              </Link>
              <button
                onClick={() => deleteDeck(deck.id)}
                className="mt-3 text-red-500 text-sm hover:underline"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">新建卡片组</h3>
            <form onSubmit={createDeck}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">名称</label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">描述（可选）</label>
                <textarea
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
```

- [ ] **Step 3: 更新路由**

`client/src/App.tsx`:
```typescript
import DecksPage from './pages/DecksPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/decks" element={<ProtectedRoute><DecksPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 4: 创建 HomePage 占位符**

`client/src/pages/HomePage.tsx`:
```typescript
import Layout from '../components/common/Layout';

export default function HomePage() {
  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">欢迎回来！</h2>
      <p className="text-gray-600">开始你的记忆之旅吧。</p>
    </Layout>
  );
}
```

- [ ] **Step 5: 测试页面**

```bash
# 登录后访问 /decks 页面
# 验证响应式布局
```

- [ ] **Step 6: 提交代码**

```bash
cd client && git add . && git commit -m "feat: 添加卡片组列表页面"
```

---

## Task 4: 卡片管理模块

### 后端 - 卡片 API

**Files:**
- Create: `server/src/controllers/cardController.ts`
- Create: `server/src/services/cardService.ts`
- Create: `server/src/routes/cardRoutes.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: 创建卡片服务**

`server/src/services/cardService.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createCard(
  deckId: string,
  userId: string,
  front: string,
  back: string,
  cardType: string = 'text',
  mediaUrls?: string[]
) {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) {
    throw new Error('卡片组不存在');
  }

  return prisma.card.create({
    data: { deckId, front, back, cardType, mediaUrls },
  });
}

export async function getDeckCards(deckId: string, userId: string) {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) {
    throw new Error('卡片组不存在');
  }

  return prisma.card.findMany({
    where: { deckId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function updateCard(cardId: string, userId: string, data: { front?: string; back?: string; cardType?: string; mediaUrls?: string[] }) {
  const card = await prisma.card.findFirst({
    where: { id: cardId },
    include: { deck: true },
  });
  if (!card || card.deck.userId !== userId) {
    throw new Error('卡片不存在');
  }

  return prisma.card.update({
    where: { id: cardId },
    data,
  });
}

export async function deleteCard(cardId: string, userId: string) {
  const card = await prisma.card.findFirst({
    where: { id: cardId },
    include: { deck: true },
  });
  if (!card || card.deck.userId !== userId) {
    throw new Error('卡片不存在');
  }

  return prisma.card.delete({ where: { id: cardId } });
}
```

- [ ] **Step 2: 创建卡片控制器**

`server/src/controllers/cardController.ts`:
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as cardService from '../services/cardService.js';

export async function createCard(req: AuthRequest, res: Response) {
  try {
    const { deckId, front, back, cardType, mediaUrls } = req.body;
    const card = await cardService.createCard(deckId, req.userId!, front, back, cardType, mediaUrls);
    res.status(201).json(card);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getCards(req: AuthRequest, res: Response) {
  try {
    const cards = await cardService.getDeckCards(req.params.deckId, req.userId!);
    res.json(cards);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateCard(req: AuthRequest, res: Response) {
  try {
    const { front, back, cardType, mediaUrls } = req.body;
    const card = await cardService.updateCard(req.params.id, req.userId!, { front, back, cardType, mediaUrls });
    res.json(card);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteCard(req: AuthRequest, res: Response) {
  try {
    await cardService.deleteCard(req.params.id, req.userId!);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
```

- [ ] **Step 3: 创建卡片路由**

`server/src/routes/cardRoutes.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as cardController from '../controllers/cardController.js';

const router = Router();

router.use(authMiddleware);

router.post('/', cardController.createCard);
router.get('/deck/:deckId', cardController.getCards);
router.put('/:id', cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

export default router;
```

- [ ] **Step 4: 注册路由**

Modify `server/src/index.ts`:
```typescript
import cardRoutes from './routes/cardRoutes.js';

app.use('/api/cards', cardRoutes);
```

- [ ] **Step 5: 测试 API**

```bash
curl -X POST http://localhost:3001/api/cards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deckId":"DECK_ID","front":"hello","back":"你好","cardType":"text"}'
```

- [ ] **Step 6: 提交代码**

```bash
cd server && git add . && git commit -m "feat: 添加卡片 CRUD API"
```

### 前端 - 卡片组详情页

**Files:**
- Create: `client/src/pages/DeckDetailPage.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: 创建卡片组详情页**

`client/src/pages/DeckDetailPage.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, Deck } from '../types';
import Layout from '../components/common/Layout';

export default function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');

  useEffect(() => {
    if (id) fetchDeckData();
  }, [id]);

  const fetchDeckData = async () => {
    try {
      const res = await api.get(`/decks/${id}`);
      setDeck(res.data);
      setCards(res.data.cards || []);
    } catch (err) {
      console.error('获取卡片组失败', err);
      navigate('/decks');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCard(null);
    setCardFront('');
    setCardBack('');
    setShowModal(true);
  };

  const openEditModal = (card: Card) => {
    setEditingCard(card);
    setCardFront(card.front);
    setCardBack(card.back);
    setShowModal(true);
  };

  const saveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCard) {
        await api.put(`/cards/${editingCard.id}`, { front: cardFront, back: cardBack });
      } else {
        await api.post('/cards', { deckId: id, front: cardFront, back: cardBack });
      }
      setShowModal(false);
      fetchDeckData();
    } catch (err) {
      console.error('保存卡片失败', err);
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm('确定要删除这张卡片吗？')) return;
    try {
      await api.delete(`/cards/${cardId}`);
      fetchDeckData();
    } catch (err) {
      console.error('删除卡片失败', err);
    }
  };

  if (loading) return <Layout><div className="text-center py-10">加载中...</div></Layout>;
  if (!deck) return null;

  return (
    <Layout>
      <div className="mb-6">
        <button onClick={() => navigate('/decks')} className="text-blue-500 hover:underline mb-4">
          ← 返回卡片组列表
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{deck.name}</h2>
            <p className="text-gray-500">{deck.description || '暂无描述'}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/decks/${id}/review`)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              开始复习
            </button>
            <button
              onClick={openCreateModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              + 添加卡片
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {cards.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-4xl mb-4">📝</p>
            <p>还没有卡片，添加第一张吧！</p>
          </div>
        ) : (
          <div className="divide-y">
            {cards.map((card, index) => (
              <div key={card.id} className="p-4 flex items-start gap-4 hover:bg-gray-50">
                <span className="text-gray-400 font-medium">{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium">正面: {card.front}</p>
                  <p className="text-gray-600">背面: {card.back}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(card)} className="text-blue-500 hover:underline">
                    编辑
                  </button>
                  <button onClick={() => deleteCard(card.id)} className="text-red-500 hover:underline">
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingCard ? '编辑卡片' : '添加卡片'}</h3>
            <form onSubmit={saveCard}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">正面（问题）</label>
                <textarea
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">背面（答案）</label>
                <textarea
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  取消
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
```

- [ ] **Step 2: 添加路由**

Modify `client/src/App.tsx`:
```typescript
import DeckDetailPage from './pages/DeckDetailPage';

<Route path="/decks/:id" element={<ProtectedRoute><DeckDetailPage /></ProtectedRoute>} />
```

- [ ] **Step 3: 测试**

```bash
# 访问卡片组详情页，添加卡片
```

- [ ] **Step 4: 提交代码**

```bash
cd client && git add . && git commit -m "feat: 添加卡片组详情页和卡片管理"
```

---

## Task 5: 艾宾浩斯复习模块

### 后端 - 复习 API

**Files:**
- Create: `server/src/controllers/reviewController.ts`
- Create: `server/src/services/reviewService.ts`
- Create: `server/src/routes/reviewRoutes.ts`
- Modify: `server/src/index.ts`

- [ ] **Step 1: 创建复习服务（核心艾宾浩斯算法）**

`server/src/services/reviewService.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_INTERVALS = [1, 2, 4, 7, 15, 30];

function calculateNextReview(easeLevel: number, reviewCount: number): Date {
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

export async function getDueCards(userId: string) {
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

export async function getDeckReviewCards(deckId: string, userId: string) {
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

export async function submitReview(cardId: string, userId: string, easeLevel: number) {
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

  if (existingRecord) {
    return prisma.reviewRecord.update({
      where: { id: existingRecord.id },
      data: {
        easeLevel,
        lastReviewAt: new Date(),
        nextReviewAt,
        reviewCount,
      },
    });
  } else {
    return prisma.reviewRecord.create({
      data: {
        cardId,
        userId,
        easeLevel,
        lastReviewAt: new Date(),
        nextReviewAt,
        reviewCount,
      },
    });
  }
}

export async function getReviewStats(userId: string) {
  const now = new Date();

  const [dueCount, learningCount, masteredCount] = await Promise.all([
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
  ]);

  const totalNew = await prisma.card.count({
    where: {
      deck: { userId },
      reviewRecords: { none: { userId } },
    },
  });

  return { dueCount, learningCount, masteredCount, newCount: totalNew };
}
```

- [ ] **Step 2: 创建复习控制器**

`server/src/controllers/reviewController.ts`:
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import * as reviewService from '../services/reviewService.js';

export async function getDueCards(req: AuthRequest, res: Response) {
  try {
    const cards = await reviewService.getDueCards(req.userId!);
    res.json(cards);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getDeckReviewCards(req: AuthRequest, res: Response) {
  try {
    const cards = await reviewService.getDeckReviewCards(req.params.deckId, req.userId!);
    res.json(cards);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function submitReview(req: AuthRequest, res: Response) {
  try {
    const { cardId, easeLevel } = req.body;
    const record = await reviewService.submitReview(cardId, req.userId!, easeLevel);
    res.json(record);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const stats = await reviewService.getReviewStats(req.userId!);
    res.json(stats);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
```

- [ ] **Step 3: 创建复习路由**

`server/src/routes/reviewRoutes.ts`:
```typescript
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import * as reviewController from '../controllers/reviewController.js';

const router = Router();

router.use(authMiddleware);

router.get('/due', reviewController.getDueCards);
router.get('/deck/:deckId', reviewController.getDeckReviewCards);
router.post('/submit', reviewController.submitReview);
router.get('/stats', reviewController.getStats);

export default router;
```

- [ ] **Step 4: 注册路由**

Modify `server/src/index.ts`:
```typescript
import reviewRoutes from './routes/reviewRoutes.js';

app.use('/api/review', reviewRoutes);
```

- [ ] **Step 5: 测试 API**

```bash
# 获取复习统计
curl http://localhost:3001/api/review/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# 获取待复习卡片
curl http://localhost:3001/api/review/due \
  -H "Authorization: Bearer YOUR_TOKEN"
```

- [ ] **Step 6: 提交代码**

```bash
cd server && git add . && git commit -m "feat: 添加艾宾浩斯复习模块"
```

### 前端 - 复习界面

**Files:**
- Create: `client/src/pages/ReviewPage.tsx`
- Create: `client/src/pages/HomePage.tsx` (更新)
- Modify: `client/src/App.tsx`

- [ ] **Step 1: 创建复习页面**

`client/src/pages/ReviewPage.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../types';
import Layout from '../components/common/Layout';

interface ReviewCard extends Card {
  deck?: { name: string };
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDueCards();
  }, [id]);

  const fetchDueCards = async () => {
    try {
      const url = id ? `/review/deck/${id}` : '/review/due';
      const res = await api.get(url);
      setCards(res.data);
    } catch (err) {
      console.error('获取复习卡片失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (easeLevel: number) => {
    const card = cards[currentIndex];
    try {
      await api.post('/review/submit', { cardId: card.id, easeLevel });
      nextCard();
    } catch (err) {
      console.error('提交复习结果失败', err);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert('恭喜！你已完成今日复习！');
      navigate(id ? `/decks/${id}` : '/');
    }
  };

  if (loading) return <Layout><div className="text-center py-10">加载中...</div></Layout>;

  if (cards.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold mb-2">太棒了！</h2>
          <p className="text-gray-500 mb-6">今日没有待复习的卡片</p>
          <button
            onClick={() => navigate(id ? `/decks/${id}` : '/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            返回
          </button>
        </div>
      </Layout>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <button onClick={() => navigate(id ? `/decks/${id}` : '/')} className="text-blue-500 hover:underline">
            ← 返回
          </button>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <span className="text-gray-600">{currentCard.deck?.name || '复习'}</span>
          <span className="text-gray-600">{currentIndex + 1} / {cards.length}</span>
        </div>

        <div className="mb-4 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          className="bg-white rounded-xl shadow-lg p-8 min-h-64 cursor-pointer flex flex-col items-center justify-center"
          onClick={handleFlip}
        >
          <p className="text-gray-400 text-sm mb-4">{isFlipped ? '答案' : '问题'}</p>
          <p className="text-xl text-center">{isFlipped ? currentCard.back : currentCard.front}</p>
          <p className="text-gray-400 text-sm mt-6">点击翻转</p>
        </div>

        {isFlipped && (
          <div className="mt-6">
            <p className="text-center text-gray-600 mb-4">你记得怎么样？</p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleRating(1)}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                忘记
              </button>
              <button
                onClick={() => handleRating(2)}
                className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
              >
                困难
              </button>
              <button
                onClick={() => handleRating(3)}
                className="px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"
              >
                一般
              </button>
              <button
                onClick={() => handleRating(4)}
                className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
              >
                简单
              </button>
              <button
                onClick={() => handleRating(5)}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
              >
                太简单
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
```

- [ ] **Step 2: 更新首页（添加统计和复习入口）**

`client/src/pages/HomePage.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/common/Layout';

interface ReviewStats {
  dueCount: number;
  learningCount: number;
  masteredCount: number;
  newCount: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/review/stats');
      setStats(res.data);
    } catch (err) {
      console.error('获取统计失败', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="text-center py-10">加载中...</div></Layout>;

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6">欢迎回来！</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-3xl font-bold text-blue-500">{stats?.dueCount || 0}</p>
          <p className="text-gray-500 text-sm">待复习</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-3xl font-bold text-orange-500">{stats?.learningCount || 0}</p>
          <p className="text-gray-500 text-sm">学习中</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-3xl font-bold text-green-500">{stats?.masteredCount || 0}</p>
          <p className="text-gray-500 text-sm">已掌握</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-3xl font-bold text-purple-500">{stats?.newCount || 0}</p>
          <p className="text-gray-500 text-sm">新卡片</p>
        </div>
      </div>

      {stats && stats.dueCount > 0 && (
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-lg mb-2">今日待复习</h3>
          <p className="text-gray-600 mb-4">你有 {stats.dueCount} 张卡片需要复习</p>
          <button
            onClick={() => navigate('/review')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            开始复习
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4">快速开始</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/decks')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <p className="text-2xl mb-2">📚</p>
            <p className="font-medium">我的卡片组</p>
            <p className="text-sm text-gray-500">管理你的卡片</p>
          </button>
          <button
            onClick={() => navigate('/community')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <p className="text-2xl mb-2">🌐</p>
            <p className="font-medium">社区广场</p>
            <p className="text-sm text-gray-500">发现优质卡片</p>
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-4 border rounded-lg hover:bg-gray-50 text-left"
          >
            <p className="text-2xl mb-2">⚙️</p>
            <p className="font-medium">设置</p>
            <p className="text-sm text-gray-500">个性化配置</p>
          </button>
        </div>
      </div>
    </Layout>
  );
}
```

- [ ] **Step 3: 添加复习路由**

Modify `client/src/App.tsx`:
```typescript
import ReviewPage from './pages/ReviewPage';

<Route path="/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
<Route path="/decks/:id/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
```

- [ ] **Step 4: 测试复习流程**

```bash
# 1. 添加几张卡片
# 2. 访问复习页面
# 3. 翻转卡片，选择记忆程度
# 4. 验证下次复习时间
```

- [ ] **Step 5: 提交代码**

```bash
cd client && git add . && git commit -m "feat: 添加复习模块和首页仪表盘"
```

---

## Task 6: 设置页面（退出登录）

**Files:**
- Create: `client/src/pages/SettingsPage.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: 创建设置页面**

`client/src/pages/SettingsPage.tsx`:
```typescript
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { User } from '../types';

const user = JSON.parse(localStorage.getItem('user') || '{}') as User;

export default function SettingsPage() {
  const navigate = useNavigate();

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
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-5 h-5" />
            <span>开启浏览器推送提醒</span>
          </label>
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

- [ ] **Step 2: 添加路由**

Modify `client/src/App.tsx`:
```typescript
import SettingsPage from './pages/SettingsPage';

<Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
```

- [ ] **Step 3: 提交代码**

```bash
cd client && git add . && git commit -m "feat: 添加设置页面"
```

---

## 最终测试和部署准备

- [ ] **Step 1: 前后端联调测试**

```bash
# 1. 启动后端
cd server && npm run dev

# 2. 启动前端
cd client && npm run dev

# 3. 测试完整流程
# - 注册/登录
# - 创建卡片组
# - 添加卡片
# - 复习卡片
# - 验证艾宾浩斯算法
```

- [ ] **Step 2: 提交 Phase 1 完成**

```bash
cd server && git add . && git commit -m "feat: 完成 Phase 1 - 核心功能"
cd client && git add . && git commit -m "feat: 完成 Phase 1 - 核心功能"
```

---

## Phase 1 总结

完成后的功能：
- ✅ 用户注册和登录
- ✅ JWT Token 认证
- ✅ 创建/编辑/删除卡片组
- ✅ 创建/编辑/删除卡片
- ✅ 艾宾浩斯复习算法
- ✅ 复习界面（翻转卡片、难度选择）
- ✅ 首页 Dashboard 统计
- ✅ 响应式布局（电脑/手机适配）
