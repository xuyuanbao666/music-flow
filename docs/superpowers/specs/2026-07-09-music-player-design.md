# MusicFlow - 三端互通高音质音乐播放器设计文档

**日期：** 2026-07-09
**状态：** 已批准
**作者：** AI Assistant

---

## 1. 项目概述

### 1.1 定位
面向音乐爱好者的跨平台高音质播放器，支持 PC、手机、Web 三端无缝体验。

### 1.2 核心价值
- **三端互通**：Windows/macOS/Linux + iOS + Android + Web
- **多源接入**：本地文件 + 第三方API + 用户音源 + 自建曲库
- **高保真播放**：FLAC/WAV/MP3 支持，10段均衡器
- **全量同步**：播放列表、进度、设置、历史全同步

### 1.3 技术选型
- **前端框架**：React 18 + TypeScript
- **桌面端**：Tauri v2 (Rust)
- **移动端**：Capacitor 6
- **Web端**：React SPA (PWA)
- **状态管理**：Zustand + TanStack Query
- **音频引擎**：Web Audio API + Howler.js
- **UI组件**：Radix UI + Tailwind CSS
- **构建工具**：Vite + Turborepo
- **后端服务**：Node.js + Hono + PostgreSQL
- **同步引擎**：CRDT (Yjs) + WebSocket

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      客户端层                                │
├──────────────┬──────────────┬──────────────┬──────────────┤
│   桌面端     │   移动端     │   Web端      │              │
│   Tauri v2   │  Capacitor   │   React SPA  │              │
│   (Rust)     │   (React)    │   (PWA)      │              │
└──────┬───────┴──────┬───────┴──────┬───────┴──────────────┘
       │              │              │
       └──────────────┼──────────────┘
                      │
┌─────────────────────┴─────────────────────────────────────┐
│                    共享核心层                               │
├──────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ 音频引擎  │  │ 同步引擎  │  │ 状态管理  │  │ API客户端│ │
│  │ (Web Audio│  │ (Yjs +   │  │ (Zustand)│  │(TanStack │ │
│  │  + Howler)│  │ WebSocket│  │          │  │  Query)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────┴─────────────────────────────────────┐
│                    服务层                                   │
├──────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  API 服务    │  │  同步服务     │  │ 音源接入服务  │    │
│  │  (Hono)      │  │  (WebSocket) │  │  (多源适配)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────┬─────────────────────────────────────┘
                      │
┌─────────────────────┴─────────────────────────────────────┐
│                    数据层                                   │
├──────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  PostgreSQL  │  │  Redis       │  │  文件存储     │    │
│  │  (主数据库)  │  │  (缓存)      │  │  (本地/P2P)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 三端代码复用策略

```
apps/
├── desktop/          # Tauri 桌面应用 (5% 平台特定代码)
│   ├── src/
│   │   ├── main.tsx        # 入口
│   │   ├── native/         # Tauri 原生桥接
│   │   └── App.tsx         # 共享应用壳
│   └── src-tauri/          # Rust 后端
├── mobile/           # Capacitor 移动应用 (5% 平台特定代码)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── native/         # Capacitor 插件
│   │   └── App.tsx
│   └── android/ & ios/
└── web/              # React Web 应用 (0% 平台特定代码)
    └── src/
        ├── main.tsx
        └── App.tsx

packages/
├── core/             # 共享核心逻辑 (90% 代码复用)
│   ├── audio/        # 音频引擎
│   ├── sync/         # 同步引擎
│   ├── store/        # 状态管理
│   └── api/          # API 客户端
├── ui/               # 共享 UI 组件库
└── utils/            # 工具函数
```

---

## 3. 核心模块设计

### 3.1 音频引擎

#### 3.1.1 架构

```typescript
// packages/core/audio/PlayerEngine.ts
interface PlayerEngine {
  // 播放控制
  play(source: AudioSource): Promise<void>
  pause(): void
  stop(): void
  seek(position: number): void
  
  // 音量控制
  setVolume(volume: number): void
  setMute(muted: boolean): void
  
  // 均衡器
  setEqualizer(bands: EqualizerBand[]): void
  loadPreset(preset: EqualizerPreset): void
  
  // 状态
  getState(): PlayerState
  onStateChange(callback: (state: PlayerState) => void): void
}

interface AudioSource {
  type: 'local' | 'stream' | 'url'
  url: string
  metadata?: TrackMetadata
}

interface PlayerState {
  status: 'playing' | 'paused' | 'stopped' | 'loading'
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  equalizer: EqualizerBand[]
}

interface EqualizerBand {
  frequency: number  // Hz
  gain: number       // dB (-12 to +12)
  type: 'lowshelf' | 'peaking' | 'highshelf'
}
```

#### 3.1.2 Web Audio API 集成

```typescript
// packages/core/audio/WebAudioEngine.ts
class WebAudioEngine implements PlayerEngine {
  private audioContext: AudioContext
  private sourceNode: AudioBufferSourceNode | MediaElementAudioSourceNode
  private gainNode: GainNode
  private equalizerNodes: BiquadFilterNode[]
  private analyserNode: AnalyserNode  // 用于可视化
  
  constructor() {
    this.audioContext = new AudioContext()
    this.setupAudioGraph()
  }
  
  private setupAudioGraph() {
    // 音频图：source → equalizer → gain → analyser → destination
    this.equalizerNodes = this.createEqualizerBands()
    this.gainNode = this.audioContext.createGain()
    this.analyserNode = this.audioContext.createAnalyser()
    
    // 连接节点
    let lastNode = this.sourceNode
    this.equalizerNodes.forEach(eq => {
      lastNode.connect(eq)
      lastNode = eq
    })
    lastNode.connect(this.gainNode)
    this.gainNode.connect(this.analyserNode)
    this.analyserNode.connect(this.audioContext.destination)
  }
  
  private createEqualizerBands(): BiquadFilterNode[] {
    const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
    return frequencies.map((freq, i) => {
      const filter = this.audioContext.createBiquadFilter()
      filter.type = i === 0 ? 'lowshelf' : i === 9 ? 'highshelf' : 'peaking'
      filter.frequency.value = freq
      filter.gain.value = 0
      return filter
    })
  }
}
```

### 3.2 同步引擎

#### 3.2.1 数据同步模型

```typescript
// packages/core/sync/SyncEngine.ts
interface SyncEngine {
  // 同步操作
  sync(data: SyncData): Promise<void>
  resolveConflict(conflict: Conflict): ResolvedData
  
  // 实时同步
  subscribe(channel: string, callback: (data: any) => void): void
  unsubscribe(channel: string): void
  
  // 离线支持
  queueOfflineChange(change: Change): void
  syncWhenOnline(): Promise<void>
}

interface SyncData {
  playlists: Playlist[]
  playbackProgress: PlaybackProgress
  favorites: string[]
  equalizerSettings: EqualizerSettings
  playHistory: PlayHistory[]
}

// 使用 Yjs CRDT 解决冲突
class CRDTSyncEngine implements SyncEngine {
  private doc: Y.Doc
  private provider: WebsocketProvider
  
  constructor(serverUrl: string) {
    this.doc = new Y.Doc()
    this.provider = new WebsocketProvider(serverUrl, 'music-sync', this.doc)
  }
  
  sync(data: SyncData) {
    const ymap = this.doc.getMap('user-data')
    ymap.set('playlists', data.playlists)
    ymap.set('progress', data.playbackProgress)
    // ... 其他数据
  }
}
```

#### 3.2.2 同步流程

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  客户端A  │     │  服务器   │     │  客户端B  │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │
     │ 1. 本地修改    │                │
     │───────────────>│                │
     │                │                │
     │ 2. CRDT合并    │                │
     │                │───────────────>│
     │                │                │
     │                │ 3. 实时推送    │
     │                │<───────────────│
     │                │                │
     │ 4. 状态同步    │                │
     │<───────────────│                │
     │                │                │
```

### 3.3 多源接入架构

#### 3.3.1 统一音源接口

```typescript
// packages/core/sources/MusicSource.ts
interface MusicSource {
  id: string
  name: string
  type: 'api' | 'subsonic' | 'local' | 'custom'
  
  // 搜索
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>
  
  // 获取歌曲
  getTrack(trackId: string): Promise<Track>
  
  // 获取播放URL
  getPlayUrl(trackId: string): Promise<string>
  
  // 获取歌词
  getLyrics(trackId: string): Promise<Lyrics | null>
  
  // 获取封面
  getCover(trackId: string): Promise<string | null>
}

// 音源管理器
class SourceManager {
  private sources: Map<string, MusicSource> = new Map()
  
  registerSource(source: MusicSource) {
    this.sources.set(source.id, source)
  }
  
  async searchAll(query: string): Promise<SearchResult[]> {
    const results = await Promise.all(
      Array.from(this.sources.values()).map(source => 
        source.search(query).catch(() => [])
      )
    )
    return results.flat()
  }
}
```

#### 3.3.2 第三方API适配器示例

```typescript
// packages/core/sources/adapters/NeteaseAdapter.ts
class NeteaseAdapter implements MusicSource {
  id = 'netease'
  name = '网易云音乐'
  type = 'api' as const
  
  private api: NeteaseAPI
  
  async search(query: string): Promise<SearchResult[]> {
    const response = await this.api.search({ keywords: query })
    return response.result.songs.map(song => ({
      id: song.id.toString(),
      title: song.name,
      artist: song.artists.map(a => a.name).join(', '),
      album: song.album.name,
      duration: song.duration / 1000,
      source: this.id
    }))
  }
  
  async getPlayUrl(trackId: string): Promise<string> {
    const response = await this.api.getSongUrl({ id: trackId })
    return response.data[0].url
  }
}
```

---

## 4. 数据模型

### 4.1 核心实体

```typescript
// packages/core/types/entities.ts

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl?: string
  source: string
  sourceId: string
  localPath?: string
  metadata: TrackMetadata
}

interface TrackMetadata {
  format: 'mp3' | 'flac' | 'wav' | 'ogg'
  bitrate?: number
  sampleRate?: number
  channels?: number
}

interface Playlist {
  id: string
  name: string
  description?: string
  userId: string
  tracks: PlaylistTrack[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

interface PlaylistTrack {
  trackId: string
  addedAt: Date
  order: number
}

interface PlaybackProgress {
  userId: string
  trackId: string
  position: number
  updatedAt: Date
}

interface EqualizerSettings {
  userId: string
  bands: EqualizerBand[]
  preset?: string
  updatedAt: Date
}

interface PlayHistory {
  id: string
  userId: string
  trackId: string
  playedAt: Date
  duration: number
}
```

### 4.2 数据库Schema

```sql
-- PostgreSQL Schema

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(500),
  album VARCHAR(500),
  duration FLOAT,
  cover_url TEXT,
  source VARCHAR(50) NOT NULL,
  source_id VARCHAR(255) NOT NULL,
  local_path TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source, source_id)
);

CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlist_tracks (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  order_index INTEGER,
  PRIMARY KEY (playlist_id, track_id)
);

CREATE TABLE playback_progress (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  position FLOAT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, track_id)
);

CREATE TABLE equalizer_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bands JSONB NOT NULL,
  preset VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE play_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  played_at TIMESTAMP DEFAULT NOW(),
  duration FLOAT
);

-- 索引
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_play_history_user_id ON play_history(user_id);
CREATE INDEX idx_play_history_played_at ON play_history(played_at);
```

---

## 5. API 设计

### 5.1 RESTful API

```typescript
// API 路由设计

// 用户认证
POST   /api/auth/register     // 注册
POST   /api/auth/login        // 登录
POST   /api/auth/logout       // 登出
GET    /api/auth/me           // 获取当前用户

// 播放列表
GET    /api/playlists         // 获取用户播放列表
POST   /api/playlists         // 创建播放列表
GET    /api/playlists/:id     // 获取播放列表详情
PUT    /api/playlists/:id     // 更新播放列表
DELETE /api/playlists/:id     // 删除播放列表
POST   /api/playlists/:id/tracks    // 添加歌曲到播放列表
DELETE /api/playlists/:id/tracks/:trackId  // 从播放列表移除歌曲

// 播放进度
GET    /api/progress/:trackId         // 获取播放进度
PUT    /api/progress/:trackId         // 更新播放进度

// 收藏
GET    /api/favorites                 // 获取收藏列表
POST   /api/favorites/:trackId        // 添加收藏
DELETE /api/favorites/:trackId        // 取消收藏

// 均衡器设置
GET    /api/equalizer                 // 获取均衡器设置
PUT    /api/equalizer                 // 更新均衡器设置

// 播放历史
GET    /api/history                   // 获取播放历史

// 音乐搜索（聚合）
GET    /api/search?q=keyword          // 跨源搜索

// 音源管理
GET    /api/sources                   // 获取可用音源
POST   /api/sources/subsonic          // 添加 Subsonic 音源
POST   /api/sources/custom            // 添加自定义音源
```

### 5.2 WebSocket API

```typescript
// 实时同步协议

// 客户端 → 服务器
interface ClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'sync' | 'heartbeat'
  channel?: string
  data?: any
}

// 服务器 → 客户端
interface ServerMessage {
  type: 'update' | 'sync' | 'error' | 'pong'
  channel?: string
  data?: any
}

// 同步频道
// - progress:{userId}    播放进度同步
// - playlist:{playlistId} 播放列表同步
// - favorites:{userId}   收藏同步
```

---

## 6. UI/UX 设计

### 6.1 主要页面

1. **首页**
   - 最近播放
   - 推荐歌单
   - 新歌速递

2. **播放页**
   - 封面展示
   - 播放控制
   - 进度条
   - 均衡器入口
   - 歌词显示

3. **搜索页**
   - 多源搜索
   - 搜索结果列表
   - 筛选（来源、类型）

4. **歌单页**
   - 我的歌单
   - 歌单详情
   - 歌曲列表

5. **设置页**
   - 账户管理
   - 音源管理
   - 均衡器设置
   - 同步设置

### 6.2 设计规范

- **设计系统**：基于 Radix UI + Tailwind CSS
- **主题**：深色主题为主，支持浅色主题
- **响应式**：适配桌面、平板、手机
- **动画**：流畅的过渡动画，增强用户体验

---

## 7. 安全设计

### 7.1 认证与授权

- JWT Token 认证
- OAuth 2.0 支持（可选）
- 角色基础访问控制（RBAC）

### 7.2 数据安全

- HTTPS 强制
- 敏感数据加密存储
- API 限流防护
- CORS 配置

### 7.3 音源安全

- 第三方 API 密钥安全存储
- 用户音源认证信息加密
- 本地文件访问权限控制

---

## 8. 性能优化

### 8.1 前端优化

- 代码分割与懒加载
- 虚拟滚动（长列表）
- 图片懒加载与缓存
- Service Worker 离线缓存

### 8.2 音频优化

- 音频预加载
- 缓冲策略优化
- 内存管理（大文件处理）

### 8.3 同步优化

- 增量同步
- 压缩传输
- 离线队列管理

---

## 9. 测试策略

### 9.1 单元测试

- 核心逻辑测试（音频引擎、同步引擎）
- 工具函数测试
- 组件测试

### 9.2 集成测试

- API 接口测试
- 同步流程测试
- 多端兼容性测试

### 9.3 E2E 测试

- 用户流程测试
- 跨平台测试

---

## 10. 部署方案

### 10.1 开发环境

- 本地开发：Vite Dev Server
- API Mock：MSW (Mock Service Worker)
- 数据库：Docker PostgreSQL

### 10.2 生产环境

- **Web**：Vercel / Netlify
- **API服务**：Docker + Kubernetes
- **数据库**：云数据库（AWS RDS / 阿里云 RDS）
- **文件存储**：对象存储（S3 / OSS）
- **CDN**：CloudFlare / 阿里云 CDN

### 10.3 桌面端打包

- Windows: MSI 安装包
- macOS: DMG 安装包
- Linux: AppImage / Deb

### 10.4 移动端发布

- iOS: App Store
- Android: Google Play / 国内应用市场

---

## 11. 开发路线图

### Phase 1 - MVP（4周）

**目标：** 可用的基础播放器

- [ ] 项目初始化（Monorepo + Tauri + Capacitor）
- [ ] 基础 UI 框架（布局 + 路由）
- [ ] 本地文件播放（Web Audio API）
- [ ] 播放列表管理
- [ ] 基础播放控制（播放/暂停/上一首/下一首）
- [ ] Web 端先行上线

### Phase 2 - 多端扩展（3周）

**目标：** 三端可用

- [ ] Tauri 桌面端打包与优化
- [ ] Capacitor 移动端适配
- [ ] 基础云同步（播放列表 + 进度）
- [ ] 用户认证系统

### Phase 3 - 音源扩展（3周）

**目标：** 多源音乐接入

- [ ] 音源抽象层实现
- [ ] 第三方 API 接入（网易云）
- [ ] Subsonic API 支持
- [ ] 多源搜索聚合
- [ ] 自定义音源支持

### Phase 4 - 高级功能（持续迭代）

**目标：** 完善体验

- [ ] 均衡器功能
- [ ] 音频可视化
- [ ] 歌词显示（LRC）
- [ ] P2P 文件同步
- [ ] 性能优化
- [ ] 深色/浅色主题

---

## 12. 风险与挑战

### 12.1 技术风险

1. **Web Audio API 兼容性**
   - 风险：不同浏览器支持程度不同
   - 应对：使用 Howler.js 抽象层，提供降级方案

2. **跨平台文件访问**
   - 风险：各平台文件系统权限不同
   - 应对：Tauri/Capacitor 提供统一的文件访问 API

3. **实时同步复杂性**
   - 风险：网络不稳定、冲突解决
   - 应对：使用成熟的 CRDT 库（Yjs），离线优先设计

### 12.2 业务风险

1. **第三方 API 稳定性**
   - 风险：API 变更、封禁
   - 应对：多源备份，抽象层隔离

2. **版权问题**
   - 风险：音乐版权纠纷
   - 应对：用户自行提供音源，平台不存储音乐文件

---

## 13. 附录

### 13.1 参考项目

- **Spotify**：优秀的用户体验和同步机制
- **Navidrome**：自托管音乐服务器的参考
- **foobar2000**：高音质播放器的功能参考
- **网易云音乐**：国内音乐平台的交互参考

### 13.2 技术参考

- Tauri 官方文档：https://tauri.app
- Capacitor 官方文档：https://capacitorjs.com
- Web Audio API：https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Yjs CRDT：https://yjs.dev

---

**文档版本：** v1.0
**最后更新：** 2026-07-09
