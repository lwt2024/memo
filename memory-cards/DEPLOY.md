# 部署指南

本文档说明如何部署记忆卡片应用，让其他人也能使用。

## 目录
- [方案一：使用 Vercel + Railway（推荐）](#方案一使用-vercel--railway推荐)
- [方案二：使用 Docker](#方案二使用-docker)
- [方案三：传统 VPS 部署](#方案三传统-vps-部署)
- [注意事项](#注意事项)

---

## 方案一：使用 Vercel + Railway（推荐）

这是最简单的部署方式，适合不想管理服务器的用户。

### 前置准备
1. GitHub 账号
2. [Vercel 账号](https://vercel.com/signup)（免费）
3. [Railway 账号](https://railway.app/)（免费额度）

### 部署步骤

#### 1. 部署后端（Railway）
```bash
# 在 GitHub 上 fork 或创建自己的仓库
# 确保仓库中包含 server/ 目录
```

1. 打开 [Railway](https://railway.app/) 并登录
2. 点击 "New Project" → "Deploy from repo"
3. 选择你的仓库
4. 配置：
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**：复制 `.env.example` 中的内容并修改
5. 点击 "Deploy" 等待部署完成

#### 2. 部署前端（Vercel）
1. 打开 [Vercel](https://vercel.com/) 并登录
2. 点击 "New Project" 选择你的仓库
3. 配置：
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Environment Variables**：
     ```
     VITE_API_URL=https://your-railway-app.railway.app/api
     ```
4. 点击 "Deploy"

---

## 方案二：使用 Docker

适合有 Docker 基础的用户。

### 前置准备
- 安装 Docker 和 Docker Compose

### 创建 docker-compose.yml

```yaml
version: '3.8'
services:
  memory-cards:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./prisma/prod.db
      - JWT_SECRET=your-very-strong-secret-key-change-in-production
      - PORT=3001
    volumes:
      - ./server/prisma:/app/server/prisma
      - ./server/uploads:/app/server/uploads
    restart: unless-stopped
```

### 部署命令
```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

---

## 方案三：传统 VPS 部署

适合想要完全控制服务器的用户。

### 前置准备
- VPS 服务器（推荐 2GB+ 内存）
- 域名（可选但推荐）

### 步骤

#### 1. 服务器准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 pm2（进程管理器）
sudo npm install -g pm2

# 安装 nginx（反向代理）
sudo apt install -y nginx
```

#### 2. 部署代码
```bash
# 克隆仓库
cd /var/www
git clone https://github.com/your-username/memo.git
cd memo

# 安装依赖
cd client && npm install && npm run build
cd ../server && npm install && npm run build

# 配置环境变量
cp .env.example .env
nano .env  # 修改配置

# 初始化数据库
npx prisma db push
npx prisma generate
```

#### 3. 使用 PM2 启动服务
```bash
cd server
pm2 start dist/index.js --name memory-cards-api
pm2 save
pm2 startup
```

#### 4. 配置 Nginx
创建配置文件 `/etc/nginx/sites-available/memory-cards`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/memo/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件
    location /uploads/ {
        proxy_pass http://localhost:3001/uploads/;
    }
}
```

启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/memory-cards /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. 配置 SSL（HTTPS）
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 注意事项

### 1. 安全配置
- **必须修改 JWT_SECRET**：使用强密码
- **数据库备份**：定期备份 SQLite 数据库文件
- **HTTPS**：生产环境必须使用 HTTPS
- **文件权限**：确保 uploads 目录有正确的写入权限

### 2. 性能优化
- SQLite 适合中小规模应用，用户超过 1000 建议迁移到 PostgreSQL
- 可以添加 Redis 缓存提高性能

### 3. 数据迁移
从开发环境迁移到生产环境：
```bash
# 备份开发数据库
cp server/prisma/dev.db backup.db

# 在生产环境初始化
cd server
npx prisma db push
```

### 4. 更新维护
```bash
# 拉取最新代码
git pull origin main

# 重新构建
cd client && npm install && npm run build
cd ../server && npm install && npm run build

# 重启服务
pm2 restart memory-cards-api
```

---

## 快速验证部署

部署完成后，访问以下地址验证：
- 前端：https://your-domain.com
- API：https://your-domain.com/api/health
