# 记忆卡片 - 艾宾浩斯记忆法学习工具

一款基于艾宾浩斯记忆法的智能卡片学习应用，帮助用户高效记忆知识。

## 🌟 功能特性

### 📚 核心功能

- **卡片组管理** - 创建、编辑、删除卡片组，支持导入分享的卡片组
- **卡片学习** - 基于艾宾浩斯遗忘曲线的智能复习系统
- **翻转卡片** - 点击翻转查看答案，模拟真实记忆卡片体验
- **记忆评级** - 根据记忆程度选择：忘记了、模糊、记对啦

### 📊 学习数据

- **签到系统** - 每日签到获得积分
- **连续签到** - 记录连续学习天数
- **学习日历** - GitHub 风格的学习活动热力图（近12个月）
- **积分系统** - 学习获得积分奖励

### 🎨 外观设置

- **深色/浅色模式** - 支持日间和夜间学习
- **四种主题风格** - 海洋蓝、莫兰迪、活力橙、极简白

### 🌐 社区功能

- **公共卡片组** - 浏览和搜索社区分享的卡片组
- **卡片组分享** - 将自己的卡片组设为公开或生成邀请码分享
- **导入功能** - 通过邀请码或公开ID导入卡片组

## 📷 界面展示

### 卡片复习页
复习模式下显示问题，点击翻转卡片查看答案，然后根据记忆程度选择评级。支持进度条显示当前复习进度。

![卡片复习-问题模式](https://raw.githubusercontent.com/lwt2024/memo/main/screenshots/review-question.png)
![卡片复习-答案模式](https://raw.githubusercontent.com/lwt2024/memo/main/screenshots/review-answer.png)

### 个人中心
包含用户信息、签到统计（连续签到天数、累计积分）、GitHub 风格学习活动热力图（近12个月）、外观设置等功能。

![个人中心](https://raw.githubusercontent.com/lwt2024/memo/main/screenshots/profile.png)

### 卡片组管理
展示用户创建和导入的所有卡片组，支持新建卡片组、通过邀请码导入、删除卡片组等操作。

![卡片组管理-海洋蓝主题](https://raw.githubusercontent.com/lwt2024/memo/main/screenshots/decks-ocean.png)
![卡片组管理-活力橙主题](https://raw.githubusercontent.com/lwt2024/memo/main/screenshots/decks-vibrant.png)

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS 3
- **路由**: React Router DOM
- **图标**: Lucide React

### 后端
- **框架**: Node.js + Express + TypeScript
- **数据库**: SQLite + Prisma ORM
- **认证**: JWT
- **邮件服务**: Nodemailer

## 📦 安装与运行

### 环境要求
- Node.js >= 20.x
- npm >= 10.x

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/lwt2024/memo.git
cd memo
```

2. **安装依赖**

```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

3. **配置数据库**

后端使用 SQLite，数据库文件已包含在项目中，无需额外配置。

4. **运行项目**

```bash
# 启动后端服务 (端口 3001)
cd server
npm run dev

# 在新终端启动前端服务 (端口 5173)
cd client
npm run dev
```

5. **访问应用**

打开浏览器访问 http://localhost:5173

### 测试账户

项目已包含模拟数据，可使用以下账号登录：
- 用户名: `demo_user`
- 密码: `123456`

## 📁 项目结构

```
memory-cards/
├── client/                    # 前端代码
│   ├── src/
│   │   ├── components/        # 公共组件
│   │   ├── context/           # React Context
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API 服务
│   │   └── types/             # TypeScript 类型定义
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                    # 后端代码
│   ├── src/
│   │   ├── controllers/       # 控制器
│   │   ├── services/          # 业务逻辑
│   │   ├── routes/            # 路由
│   │   ├── middlewares/       # 中间件
│   │   └── index.ts           # 入口文件
│   ├── prisma/                # Prisma 配置
│   ├── .env                   # 环境变量
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 主要功能实现

### 智能复习算法
基于艾宾浩斯遗忘曲线，根据用户的记忆评级自动计算下次复习时间：
- **忘记了**: 1天后复习
- **模糊**: 3天后复习  
- **记对啦**: 7天后复习

### 签到日历
采用 GitHub 风格的热力图展示，支持：
- 近12个月的学习数据展示
- 根据学习强度显示不同颜色
- Hover 显示详细学习信息

### 主题系统
支持四种精心设计的主题风格：
- 🌊 海洋蓝 - 清新护眼，适合长时间学习
- 🎨 莫兰迪 - 低饱和柔和色调，耐看舒适
- 🔥 活力橙 - 热情活力，激发学习动力
- ⬜ 极简白 - 简洁纯净，专注内容

## 📝 开发说明

### 添加新功能

1. 在 `server/src/controllers/` 添加新控制器
2. 在 `server/src/services/` 添加业务逻辑
3. 在 `server/src/routes/` 注册路由
4. 在 `client/src/services/api.ts` 添加 API 调用
5. 在 `client/src/pages/` 或 `client/src/components/` 添加组件

### 构建生产版本

```bash
# 前端构建
cd client
npm run build

# 后端构建
cd server
npm run build
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**使用提示**: 建议每天定时复习卡片，坚持连续签到获得更好的学习效果！