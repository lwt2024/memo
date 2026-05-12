FROM node:20-alpine AS base
WORKDIR /app

# 复制项目文件
COPY package*.json ./

# 构建阶段
FROM base AS builder
WORKDIR /app

# 安装客户端依赖并构建
COPY client/package*.json client/
RUN cd client && npm ci && npm run build

# 安装服务端依赖并构建
COPY server/package*.json server/
RUN cd server && npm ci && npm run build

# 生产阶段
FROM base AS production
WORKDIR /app

# 复制必要文件
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/server/prisma ./server/prisma

# 创建必要目录
RUN mkdir -p server/uploads
RUN mkdir -p server/prisma

# 暴露端口
EXPOSE 3001 5173

# 启动命令
WORKDIR /app/server
CMD ["node", "dist/index.js"]
