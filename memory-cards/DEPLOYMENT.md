# 部署指南

## 问题说明

之前使用 SQLite 数据库在 Railway 部署时有数据丢失问题，因为每次重新部署都是新的容器，数据库文件不会被持久化。

## 解决方案

### 方案一：使用 Railway PostgreSQL（推荐）

1. 在 Railway 项目中添加 PostgreSQL 数据库服务
2. Railway 会自动提供 `DATABASE_URL` 环境变量
3. 更新 Prisma schema 支持 PostgreSQL（当前已完成）

### 方案二：使用 Railway Volume 持久化 SQLite

1. 在 Railway 项目中添加 Volume
2. 挂载到 `/app/server` 目录
3. 保持使用 SQLite 数据库

## 当前配置

项目现在配置为：
- 本地开发：使用 SQLite（`dev.db`）
- 生产部署：可使用 PostgreSQL 或 SQLite + Volume

## 部署步骤

### 在 Railway 上配置

1. **添加 PostgreSQL（可选但推荐）**
   - 在 Railway 项目 → Add Service → Database → PostgreSQL
   - 等待数据库就绪
   - 系统会自动设置 `DATABASE_URL` 环境变量

2. **或者使用 Volume（保持 SQLite）**
   - 在 Railway 项目 → Add Service → Volume
   - 挂载路径：`/app/server`
   - 这样数据库文件会被持久化

3. **设置环境变量**
   - 确保 `DATABASE_URL` 已设置（如果使用 PostgreSQL）
   - 确保 `JWT_SECRET` 已设置

4. **重新部署**
   - 提交代码并推送到 GitHub
   - Railway 会自动重新部署

### 关于数据丢失

如果之前的数据丢失了，你需要：

1. 重新注册账号
2. 重新创建卡片组和卡片
3. 如果之前有本地数据库，可以使用本地数据

## 本地开发

```bash
cd memory-cards/server
npm install
npm run db:generate
npm run dev
```

## 生产环境

项目现在会在启动时自动运行数据库迁移：

```bash
npm run db:push && npm start
```

## 验证部署

部署完成后：
1. 访问你的应用
2. 注册新账号
3. 创建测试卡片组
4. 重新部署一次
5. 验证数据是否还在
