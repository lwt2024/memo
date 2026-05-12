#!/bin/bash

# 快速部署脚本 - 适用于 Linux/Mac
# 使用方法：chmod +x deploy.sh && ./deploy.sh

echo "🚀 记忆卡片应用快速部署"
echo "=============================="

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 20+"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

echo ""
echo "📦 安装依赖..."

# 安装前端依赖
echo "📱 安装前端依赖..."
cd client && npm install
if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi

# 安装后端依赖
echo "🔧 安装后端依赖..."
cd ../server && npm install
if [ $? -ne 0 ]; then
    echo "❌ 后端依赖安装失败"
    exit 1
fi

cd ..

echo ""
echo "🏗️  构建项目..."

# 构建前端
echo "📱 构建前端..."
cd client && npm run build
if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

# 构建后端
echo "🔧 构建后端..."
cd ../server && npm run build
if [ $? -ne 0 ]; then
    echo "❌ 后端构建失败"
    exit 1
fi

cd ..

echo ""
echo "⚙️  配置环境变量..."

# 检查是否存在 .env 文件
if [ ! -f "server/.env" ]; then
    echo "📝 复制环境变量配置..."
    cp server/.env.example server/.env
    echo "⚠️  请编辑 server/.env 文件，修改 JWT_SECRET 等配置"
fi

# 初始化数据库
echo "🗄️  初始化数据库..."
cd server && npx prisma generate && npx prisma db push
if [ $? -ne 0 ]; then
    echo "❌ 数据库初始化失败"
    exit 1
fi

cd ..

echo ""
echo "✅ 部署准备完成！"
echo ""
echo "启动方式："
echo "  开发模式："
echo "    cd server && npm run dev &"
echo "    cd ../client && npm run dev"
echo ""
echo "  生产模式："
echo "    cd server && npm start"
echo ""
echo "访问地址：http://localhost:3001"
echo ""
