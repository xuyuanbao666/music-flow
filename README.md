# 🎵 MusicFlow

三端互通高音质音乐播放器 - Cross-platform High-quality Music Player

[English Version](./README_EN.md)

## ✨ 功能特性

### 🎵 音乐播放
- 本地音乐文件导入（拖拽或点击）
- 支持 MP3, WAV, FLAC, OGG, AAC 格式
- 播放/暂停/上一首/下一首
- 播放进度条控制

### 🔀 播放模式
- 随机播放
- 单曲循环
- 列表循环

### 🔊 音频控制
- 音量调节
- 静音切换
- 10 段均衡器（平坦/低音增强/人声预设）
- 音频频谱可视化

### 📝 歌词功能
- LRC 歌词文件导入
- 同步歌词显示
- 点击歌词跳转

### ❤️ 收藏系统
- 收藏喜欢的歌曲
- 最近播放记录
- 播放列表管理

### 🔍 多源搜索
- 网易云音乐搜索
- Subsonic 服务器支持
- 统一搜索界面

### ⌨️ 快捷键
- `空格` - 播放/暂停
- `Ctrl + →` - 下一首
- `Ctrl + ←` - 上一首
- `Ctrl + ↑` - 音量增加
- `Ctrl + ↓` - 音量减少
- `Ctrl + S` - 随机播放
- `Ctrl + R` - 循环模式

### 🌙 主题
- 深色模式（默认）
- 浅色模式
- 主题切换

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 9

### 安装依赖
```bash
# 克隆项目
git clone https://github.com/xuyuanbao666/music-flow.git
cd music-flow

# 安装依赖
pnpm install
```

### 启动开发服务器
```bash
# 启动 Web 端
pnpm --filter @music-flow/web dev
```

访问 http://localhost:3000

### 构建生产版本
```bash
pnpm build
```

## 📁 项目结构

```
music-flow/
├── apps/
│   └── web/                    # React Web 应用
│       ├── src/
│       │   ├── components/     # UI 组件
│       │   │   ├── Player/     # 播放器组件
│       │   │   ├── Lyrics/     # 歌词组件
│       │   │   ├── Search/     # 搜索组件
│       │   │   ├── Home/       # 首页组件
│       │   │   └── Layout/     # 布局组件
│       │   ├── store/          # Zustand 状态管理
│       │   ├── services/       # 服务层
│       │   ├── hooks/          # 自定义 Hooks
│       │   └── App.tsx         # 主应用
│       └── package.json
├── packages/
│   ├── core/                   # 共享核心逻辑
│   │   ├── audio/              # 音频引擎
│   │   ├── sources/            # 音源管理
│   │   ├── lyrics/             # 歌词解析
│   │   └── types/              # 类型定义
│   └── ui/                     # 共享 UI 组件
├── services/
│   └── api/                    # 后端 API（可选）
├── package.json
├── turbo.json
└── README.md
```

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建**: Vite
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **UI 组件**: 自定义组件库

### 音频
- **播放引擎**: Web Audio API
- **均衡器**: BiquadFilterNode
- **可视化**: Canvas API + AnalyserNode

### 后端（可选）
- **服务器**: Hono
- **数据库**: PostgreSQL + Prisma
- **认证**: JWT + bcrypt

### 开发工具
- **Monorepo**: Turborepo
- **包管理**: pnpm
- **类型检查**: TypeScript

## 📦 依赖包

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "@music-flow/core": "workspace:*",
    "@music-flow/ui": "workspace:*"
  }
}
```

## 🎨 界面预览

### 登录页面
- 邮箱/密码登录
- 新用户注册
- 跳过登录直接使用

### 主界面
- 左侧导航栏
- 首页：最近播放 + 收藏
- 音乐库：文件导入
- 搜索：多源搜索

### 播放器
- 底部播放栏
- 进度条
- 音量控制
- 均衡器面板
- 歌词面板
- 迷你播放器模式

## 🔧 开发指南

### 添加新音源
```typescript
// packages/core/src/sources/adapters/YourAdapter.ts
import { MusicSource, SearchResult } from '../MusicSource'

export class YourAdapter implements MusicSource {
  id = 'your-source'
  name = 'Your Source'
  type = 'api' as const

  async search(query: string): Promise<SearchResult[]> {
    // 实现搜索逻辑
  }

  async getTrack(trackId: string): Promise<Track> {
    // 实现获取歌曲逻辑
  }

  async getPlayUrl(trackId: string): Promise<string> {
    // 实现获取播放地址逻辑
  }
}
```

### 添加均衡器预设
```typescript
// packages/core/src/audio/Equalizer.ts
export const DEFAULT_PRESETS: EqualizerPreset[] = [
  {
    id: 'your-preset',
    name: 'Your Preset',
    bands: [
      { frequency: 32, gain: 3, type: 'lowshelf' },
      // ... 其他频段
    ]
  }
]
```

## 📝 API 文档

### 认证 API
```
POST /api/auth/register  - 用户注册
POST /api/auth/login     - 用户登录
```

### 同步 API
```
GET  /api/sync/data       - 获取用户数据
POST /api/sync/playlists  - 同步播放列表
POST /api/sync/progress   - 同步播放进度
POST /api/sync/equalizer  - 同步均衡器设置
POST /api/sync/favorites  - 同步收藏
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'Add your feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 📞 联系方式

- GitHub: [xuyuanbao666](https://github.com/xuyuanbao666)
- 项目地址: [music-flow](https://github.com/xuyuanbao666/music-flow)
