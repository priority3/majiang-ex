# 麻将练习工具

一个基于 React + TypeScript 的麻将练习应用，帮助玩家提升麻将技巧。

## 功能特点

### 四种练习模式

- **练习模式 (Practice)** - 自由练习，点击手牌进行出牌和摸牌操作
- **竞速模式 (Speed)** - 30 秒限时挑战，测试出牌速度
- **推荐模式 (AI)** - AI 分析手牌，推荐最佳出牌策略
- **听牌模式 (Ting)** - 计算当前手牌的听牌情况

### 核心功能

- **手牌管理** - 点击选中牌，支持出牌和摸牌
- **自动排序** - 按万、条、筒、字牌自动整理手牌
- **计分系统** - 根据出牌策略计算分数
- **成就系统** - 完成特定目标解锁成就
- **教程引导** - 新手友好的操作说明
- **响应式设计** - 支持桌面和移动端

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **状态管理**: React Hooks
- **动画**: CSS Transitions + 粒子特效

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── MajiangHand.tsx      # 主手牌组件
│   ├── MajiangTile.tsx      # 单张麻将牌
│   ├── PracticeMode.tsx     # 练习模式
│   ├── SpeedMode.tsx        # 竞速模式
│   ├── PatternMode.tsx      # 推荐模式
│   ├── TingMode.tsx         # 听牌模式
│   └── ...
├── App.tsx              # 应用入口
├── main.tsx             # 应用入口
└── index.css            # 全局样式
```

Thanks for the support and feedback from the friends at [LINUX DO](https://linux.do/).
