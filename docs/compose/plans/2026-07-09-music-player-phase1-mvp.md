# MusicFlow Phase 1 - MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个可用的基础音乐播放器，支持本地文件播放、播放列表管理，Web 端先行上线。

**Architecture:** 使用 Turborepo Monorepo 结构，共享核心逻辑包，Web 应用作为首个客户端。音频引擎基于 Web Audio API，状态管理使用 Zustand。

**Tech Stack:** React 18, TypeScript, Vite, Turborepo, Zustand, Web Audio API, Howler.js, Tailwind CSS, Radix UI

---

## 文件结构

```
music-flow/
├── apps/
│   └── web/                          # React Web 应用
│       ├── src/
│       │   ├── components/           # UI 组件
│       │   │   ├── Player/           # 播放器组件
│       │   │   ├── Playlist/         # 播放列表组件
│       │   │   ├── TrackList/        # 歌曲列表组件
│       │   │   └── Layout/           # 布局组件
│       │   ├── pages/                # 页面
│       │   ├── hooks/                # 自定义 hooks
│       │   ├── store/                # Zustand store
│       │   ├── services/             # 服务层
│       │   ├── types/                # 类型定义
│       │   ├── App.tsx               # 主应用
│       │   ├── main.tsx              # 入口
│       │   └── index.css             # 全局样式
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       └── postcss.config.js
├── packages/
│   ├── core/                         # 共享核心逻辑
│   │   ├── audio/                    # 音频引擎
│   │   │   ├── AudioEngine.ts        # 音频引擎接口
│   │   │   ├── WebAudioEngine.ts     # Web Audio API 实现
│   │   │   ├── Equalizer.ts          # 均衡器
│   │   │   └── index.ts
│   │   ├── playlist/                 # 播放列表管理
│   │   │   ├── PlaylistManager.ts    # 播放列表管理器
│   │   │   └── index.ts
│   │   ├── types/                    # 核心类型
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/                           # 共享 UI 组件库
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── tsconfig/                     # 共享 TypeScript 配置
│       ├── base.json
│       ├── react.json
│       └── package.json
├── package.json                      # 根 package.json
├── turbo.json                        # Turborepo 配置
└── .gitignore
```

---

## Task 1: 项目初始化与 Monorepo 搭建

**Covers:** 项目基础设施

**Files:**
- Create: `package.json`
- Create: `turbo.json`
- Create: `.gitignore`
- Create: `packages/tsconfig/base.json`
- Create: `packages/tsconfig/react.json`
- Create: `packages/tsconfig/package.json`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/ui/package.json`
- Create: `packages/ui/tsconfig.json`
- Create: `apps/web/package.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tailwind.config.js`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/index.css`

- [ ] **Step 1: 初始化 Git 仓库**

```bash
cd H:/vscode_project/music_balbal
git init
```

- [ ] **Step 2: 创建根 package.json**

```json
{
  "name": "music-flow",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 3: 创建 turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

- [ ] **Step 4: 创建 .gitignore**

```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.turbo/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Testing
coverage/

# Misc
*.tsbuildinfo
```

- [ ] **Step 5: 创建共享 TypeScript 配置**

`packages/tsconfig/base.json`:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "checkJs": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "jsx": "react-jsx"
  }
}
```

`packages/tsconfig/react.json`:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "target": "ES2022"
  }
}
```

`packages/tsconfig/package.json`:
```json
{
  "name": "@music-flow/tsconfig",
  "version": "0.1.0",
  "private": true,
  "files": ["base.json", "react.json"]
}
```

- [ ] **Step 6: 创建 core 包**

`packages/core/package.json`:
```json
{
  "name": "@music-flow/core",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "@music-flow/tsconfig": "workspace:*",
    "typescript": "^5.4.0"
  }
}
```

`packages/core/tsconfig.json`:
```json
{
  "extends": "@music-flow/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 7: 创建 ui 包**

`packages/ui/package.json`:
```json
{
  "name": "@music-flow/ui",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@music-flow/tsconfig": "workspace:*",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0"
  }
}
```

`packages/ui/tsconfig.json`:
```json
{
  "extends": "@music-flow/tsconfig/react.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 8: 创建 Web 应用**

`apps/web/package.json`:
```json
{
  "name": "@music-flow/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@music-flow/core": "workspace:*",
    "@music-flow/ui": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "howler": "^2.2.4"
  },
  "devDependencies": {
    "@music-flow/tsconfig": "workspace:*",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/howler": "^2.2.8",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

`apps/web/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
})
```

`apps/web/tsconfig.json`:
```json
{
  "extends": "@music-flow/tsconfig/react.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "vite-env.d.ts"],
  "references": [
    { "path": "../../packages/core" },
    { "path": "../../packages/ui" }
  ]
}
```

`apps/web/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
```

`apps/web/postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

`apps/web/index.html`:
```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MusicFlow</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`apps/web/src/main.tsx`:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

`apps/web/src/App.tsx`:
```typescript
function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold p-8">MusicFlow</h1>
      <p className="px-8 text-gray-400">三端互通高音质音乐播放器</p>
    </div>
  )
}

export default App
```

`apps/web/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0f0f1a;
  --foreground: #ffffff;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--background);
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

* {
  box-sizing: border-box;
}
```

- [ ] **Step 9: 安装依赖并验证**

```bash
cd H:/vscode_project/music_balbal
pnpm install
```

Expected: 依赖安装成功，无错误

- [ ] **Step 10: 启动开发服务器验证**

```bash
pnpm dev
```

Expected: Web 应用在 http://localhost:3000 运行，显示 "MusicFlow" 标题

- [ ] **Step 11: 提交代码**

```bash
git add .
git commit -m "feat: initialize monorepo with Turborepo, React, and Vite"
```

---

## Task 2: 核心类型定义

**Covers:** 数据模型基础

**Files:**
- Create: `packages/core/src/types/index.ts`
- Create: `packages/core/src/index.ts`

- [ ] **Step 1: 创建核心类型定义**

`packages/core/src/types/index.ts`:
```typescript
// 歌曲元数据
export interface TrackMetadata {
  format: 'mp3' | 'flac' | 'wav' | 'ogg' | 'aac'
  bitrate?: number
  sampleRate?: number
  channels?: number
}

// 歌曲
export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl?: string
  source: 'local' | 'stream' | 'url'
  sourceId: string
  localPath?: string
  metadata: TrackMetadata
}

// 播放列表
export interface Playlist {
  id: string
  name: string
  description?: string
  tracks: PlaylistTrack[]
  createdAt: Date
  updatedAt: Date
}

// 播放列表中的歌曲
export interface PlaylistTrack {
  trackId: string
  addedAt: Date
  order: number
}

// 播放状态
export type PlaybackStatus = 'playing' | 'paused' | 'stopped' | 'loading' | 'error'

// 播放器状态
export interface PlayerState {
  status: PlaybackStatus
  currentTrack: Track | null
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  repeatMode: RepeatMode
  shuffle: boolean
}

// 重复模式
export type RepeatMode = 'none' | 'one' | 'all'

// 均衡器频段
export interface EqualizerBand {
  frequency: number
  gain: number
  type: 'lowshelf' | 'peaking' | 'highshelf'
}

// 均衡器预设
export interface EqualizerPreset {
  id: string
  name: string
  bands: EqualizerBand[]
}

// 播放队列
export interface PlayQueue {
  tracks: Track[]
  currentIndex: number
}
```

- [ ] **Step 2: 创建 core 包入口**

`packages/core/src/index.ts`:
```typescript
export * from './types'
export * from './audio'
export * from './playlist'
```

- [ ] **Step 3: 验证类型编译**

```bash
cd H:/vscode_project/music_balbal/packages/core
pnpm lint
```

Expected: 无类型错误

- [ ] **Step 4: 提交代码**

```bash
git add packages/core/src/types/index.ts packages/core/src/index.ts
git commit -m "feat: add core type definitions for Track, Playlist, and Player"
```

---

## Task 3: 音频引擎实现

**Covers:** 音频播放核心功能

**Files:**
- Create: `packages/core/src/audio/AudioEngine.ts`
- Create: `packages/core/src/audio/WebAudioEngine.ts`
- Create: `packages/core/src/audio/Equalizer.ts`
- Create: `packages/core/src/audio/index.ts`
- Create: `packages/core/src/audio/__tests__/AudioEngine.test.ts`

- [ ] **Step 1: 编写音频引擎接口测试**

`packages/core/src/audio/__tests__/AudioEngine.test.ts`:
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WebAudioEngine } from '../WebAudioEngine'

// Mock Web Audio API
const mockAudioContext = {
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1 },
  })),
  createBiquadFilter: vi.fn(() => ({
    connect: vi.fn(),
    type: 'peaking',
    frequency: { value: 0 },
    gain: { value: 0 },
    Q: { value: 1 },
  })),
  createAnalyser: vi.fn(() => ({
    connect: vi.fn(),
    fftSize: 2048,
    frequencyBinCount: 1024,
    getByteFrequencyData: vi.fn(),
  })),
  createMediaElementSource: vi.fn(() => ({
    connect: vi.fn(),
  })),
  destination: {},
  state: 'running',
  resume: vi.fn(),
  close: vi.fn(),
}

// Mock HTMLAudioElement
const mockAudio = {
  play: vi.fn(),
  pause: vi.fn(),
  load: vi.fn(),
  src: '',
  currentTime: 0,
  duration: 100,
  volume: 1,
  muted: false,
  paused: true,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

describe('WebAudioEngine', () => {
  let engine: WebAudioEngine

  beforeEach(() => {
    vi.clearAllMocks()
    // @ts-ignore
    global.AudioContext = vi.fn(() => mockAudioContext)
    // @ts-ignore
    global.Audio = vi.fn(() => mockAudio)
    engine = new WebAudioEngine()
  })

  it('should initialize with default state', () => {
    const state = engine.getState()
    expect(state.status).toBe('stopped')
    expect(state.currentTrack).toBeNull()
    expect(state.currentTime).toBe(0)
    expect(state.volume).toBe(1)
    expect(state.muted).toBe(false)
  })

  it('should set volume', () => {
    engine.setVolume(0.5)
    const state = engine.getState()
    expect(state.volume).toBe(0.5)
  })

  it('should clamp volume between 0 and 1', () => {
    engine.setVolume(1.5)
    expect(engine.getState().volume).toBe(1)
    
    engine.setVolume(-0.5)
    expect(engine.getState().volume).toBe(0)
  })

  it('should toggle mute', () => {
    engine.setMute(true)
    expect(engine.getState().muted).toBe(true)
    
    engine.setMute(false)
    expect(engine.getState().muted).toBe(false)
  })
})
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd H:/vscode_project/music_balbal
pnpm --filter @music-flow/core test
```

Expected: FAIL - 模块不存在

- [ ] **Step 3: 实现音频引擎接口**

`packages/core/src/audio/AudioEngine.ts`:
```typescript
import { Track, PlayerState, EqualizerBand, EqualizerPreset } from '../types'

export interface AudioEngine {
  // 播放控制
  play(source: Track | string): Promise<void>
  pause(): void
  resume(): void
  stop(): void
  seek(position: number): void
  
  // 音量控制
  setVolume(volume: number): void
  setMute(muted: boolean): void
  
  // 均衡器
  setEqualizer(bands: EqualizerBand[]): void
  loadPreset(preset: EqualizerPreset): void
  getEqualizerPresets(): EqualizerPreset[]
  
  // 状态
  getState(): PlayerState
  onStateChange(callback: (state: PlayerState) => void): () => void
  
  // 资源清理
  destroy(): void
}
```

- [ ] **Step 4: 实现均衡器**

`packages/core/src/audio/Equalizer.ts`:
```typescript
import { EqualizerBand, EqualizerPreset } from '../types'

export const DEFAULT_PRESETS: EqualizerPreset[] = [
  {
    id: 'flat',
    name: '平坦',
    bands: [
      { frequency: 32, gain: 0, type: 'lowshelf' },
      { frequency: 64, gain: 0, type: 'peaking' },
      { frequency: 125, gain: 0, type: 'peaking' },
      { frequency: 250, gain: 0, type: 'peaking' },
      { frequency: 500, gain: 0, type: 'peaking' },
      { frequency: 1000, gain: 0, type: 'peaking' },
      { frequency: 2000, gain: 0, type: 'peaking' },
      { frequency: 4000, gain: 0, type: 'peaking' },
      { frequency: 8000, gain: 0, type: 'peaking' },
      { frequency: 16000, gain: 0, type: 'highshelf' },
    ],
  },
  {
    id: 'bass-boost',
    name: '低音增强',
    bands: [
      { frequency: 32, gain: 6, type: 'lowshelf' },
      { frequency: 64, gain: 5, type: 'peaking' },
      { frequency: 125, gain: 4, type: 'peaking' },
      { frequency: 250, gain: 2, type: 'peaking' },
      { frequency: 500, gain: 0, type: 'peaking' },
      { frequency: 1000, gain: 0, type: 'peaking' },
      { frequency: 2000, gain: 0, type: 'peaking' },
      { frequency: 4000, gain: 0, type: 'peaking' },
      { frequency: 8000, gain: 0, type: 'peaking' },
      { frequency: 16000, gain: 0, type: 'highshelf' },
    ],
  },
  {
    id: 'vocal',
    name: '人声',
    bands: [
      { frequency: 32, gain: -2, type: 'lowshelf' },
      { frequency: 64, gain: -1, type: 'peaking' },
      { frequency: 125, gain: 0, type: 'peaking' },
      { frequency: 250, gain: 2, type: 'peaking' },
      { frequency: 500, gain: 4, type: 'peaking' },
      { frequency: 1000, gain: 4, type: 'peaking' },
      { frequency: 2000, gain: 3, type: 'peaking' },
      { frequency: 4000, gain: 1, type: 'peaking' },
      { frequency: 8000, gain: 0, type: 'peaking' },
      { frequency: 16000, gain: -1, type: 'highshelf' },
    ],
  },
]

export class Equalizer {
  private bands: EqualizerBand[]

  constructor(bands?: EqualizerBand[]) {
    this.bands = bands || DEFAULT_PRESETS[0].bands
  }

  getBands(): EqualizerBand[] {
    return [...this.bands]
  }

  setBands(bands: EqualizerBand[]): void {
    this.bands = bands.map(band => ({
      ...band,
      gain: Math.max(-12, Math.min(12, band.gain)),
    }))
  }

  loadPreset(preset: EqualizerPreset): void {
    this.setBands(preset.bands)
  }

  getPresets(): EqualizerPreset[] {
    return DEFAULT_PRESETS
  }
}
```

- [ ] **Step 5: 实现 Web Audio 引擎**

`packages/core/src/audio/WebAudioEngine.ts`:
```typescript
import { Track, PlayerState, PlaybackStatus, EqualizerBand, EqualizerPreset } from '../types'
import { AudioEngine } from './AudioEngine'
import { Equalizer, DEFAULT_PRESETS } from './Equalizer'

export class WebAudioEngine implements AudioEngine {
  private audio: HTMLAudioElement
  private audioContext: AudioContext | null = null
  private sourceNode: MediaElementAudioSourceNode | null = null
  private gainNode: GainNode | null = null
  private equalizerNodes: BiquadFilterNode[] = []
  private analyserNode: AnalyserNode | null = null
  private equalizer: Equalizer
  private state: PlayerState
  private listeners: Set<(state: PlayerState) => void> = new Set()
  private updateInterval: number | null = null

  constructor() {
    this.audio = new Audio()
    this.equalizer = new Equalizer()
    this.state = {
      status: 'stopped',
      currentTrack: null,
      currentTime: 0,
      duration: 0,
      volume: 1,
      muted: false,
      repeatMode: 'none',
      shuffle: false,
    }

    this.setupAudioEvents()
  }

  private setupAudioEvents(): void {
    this.audio.addEventListener('play', () => {
      this.updateState({ status: 'playing' })
    })

    this.audio.addEventListener('pause', () => {
      this.updateState({ status: 'paused' })
    })

    this.audio.addEventListener('ended', () => {
      this.handleTrackEnd()
    })

    this.audio.addEventListener('loadedmetadata', () => {
      this.updateState({ duration: this.audio.duration })
    })

    this.audio.addEventListener('timeupdate', () => {
      this.updateState({ currentTime: this.audio.currentTime })
    })

    this.audio.addEventListener('error', () => {
      this.updateState({ status: 'error' })
    })
  }

  private async initAudioContext(): Promise<void> {
    if (this.audioContext) return

    this.audioContext = new AudioContext()
    this.sourceNode = this.audioContext.createMediaElementSource(this.audio)
    this.gainNode = this.audioContext.createGain()
    this.analyserNode = this.audioContext.createAnalyser()

    this.equalizerNodes = this.createEqualizerNodes()

    // 连接音频图：source → equalizer → gain → analyser → destination
    let lastNode: AudioNode = this.sourceNode
    this.equalizerNodes.forEach(eq => {
      lastNode.connect(eq)
      lastNode = eq
    })
    lastNode.connect(this.gainNode)
    this.gainNode.connect(this.analyserNode)
    this.analyserNode.connect(this.audioContext.destination)

    // 应用当前均衡器设置
    this.applyEqualizer()
  }

  private createEqualizerNodes(): BiquadFilterNode[] {
    if (!this.audioContext) return []

    return this.equalizer.getBands().map((band, i) => {
      const filter = this.audioContext!.createBiquadFilter()
      filter.type = band.type
      filter.frequency.value = band.frequency
      filter.gain.value = band.gain
      filter.Q.value = 1
      return filter
    })
  }

  private applyEqualizer(): void {
    const bands = this.equalizer.getBands()
    this.equalizerNodes.forEach((node, i) => {
      if (bands[i]) {
        node.gain.value = bands[i].gain
      }
    })
  }

  private updateState(partial: Partial<PlayerState>): void {
    this.state = { ...this.state, ...partial }
    this.notifyListeners()
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state))
  }

  private handleTrackEnd(): void {
    const { repeatMode } = this.state
    if (repeatMode === 'one') {
      this.audio.currentTime = 0
      this.audio.play()
    } else {
      this.updateState({ status: 'stopped', currentTime: 0 })
    }
  }

  async play(source: Track | string): Promise<void> {
    try {
      await this.initAudioContext()

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      const url = typeof source === 'string' ? source : source.sourceId
      this.audio.src = url
      
      const track: Track = typeof source === 'string' 
        ? {
            id: url,
            title: url.split('/').pop() || 'Unknown',
            artist: 'Unknown',
            album: 'Unknown',
            duration: 0,
            source: 'url',
            sourceId: url,
            metadata: { format: 'mp3' },
          }
        : source

      this.updateState({ 
        status: 'loading', 
        currentTrack: track,
        currentTime: 0,
      })

      await this.audio.play()
    } catch (error) {
      this.updateState({ status: 'error' })
      throw error
    }
  }

  pause(): void {
    this.audio.pause()
  }

  resume(): void {
    this.audio.play()
  }

  stop(): void {
    this.audio.pause()
    this.audio.currentTime = 0
    this.updateState({ 
      status: 'stopped', 
      currentTime: 0,
    })
  }

  seek(position: number): void {
    this.audio.currentTime = Math.max(0, Math.min(position, this.state.duration))
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    this.audio.volume = clampedVolume
    if (this.gainNode) {
      this.gainNode.gain.value = clampedVolume
    }
    this.updateState({ volume: clampedVolume })
  }

  setMute(muted: boolean): void {
    this.audio.muted = muted
    this.updateState({ muted })
  }

  setEqualizer(bands: EqualizerBand[]): void {
    this.equalizer.setBands(bands)
    this.applyEqualizer()
  }

  loadPreset(preset: EqualizerPreset): void {
    this.equalizer.loadPreset(preset)
    this.applyEqualizer()
  }

  getEqualizerPresets(): EqualizerPreset[] {
    return DEFAULT_PRESETS
  }

  getState(): PlayerState {
    return { ...this.state }
  }

  onStateChange(callback: (state: PlayerState) => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }

  destroy(): void {
    this.audio.pause()
    this.audio.src = ''
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.listeners.clear()
  }
}
```

- [ ] **Step 6: 创建 audio 模块入口**

`packages/core/src/audio/index.ts`:
```typescript
export { AudioEngine } from './AudioEngine'
export { WebAudioEngine } from './WebAudioEngine'
export { Equalizer, DEFAULT_PRESETS } from './Equalizer'
```

- [ ] **Step 7: 更新 core 包入口**

`packages/core/src/index.ts`:
```typescript
export * from './types'
export * from './audio'
```

- [ ] **Step 8: 运行测试验证**

```bash
cd H:/vscode_project/music_balbal
pnpm --filter @music-flow/core test
```

Expected: 所有测试通过

- [ ] **Step 9: 提交代码**

```bash
git add packages/core/src/audio
git commit -m "feat: implement Web Audio Engine with equalizer support"
```

---

## Task 4: Zustand Store 实现

**Covers:** 状态管理

**Files:**
- Create: `apps/web/src/store/playerStore.ts`
- Create: `apps/web/src/store/playlistStore.ts`
- Create: `apps/web/src/store/index.ts`

- [ ] **Step 1: 创建播放器 Store**

`apps/web/src/store/playerStore.ts`:
```typescript
import { create } from 'zustand'
import { Track, PlayerState, RepeatMode, EqualizerBand } from '@music-flow/core'
import { WebAudioEngine } from '@music-flow/core'

interface PlayerStore {
  engine: WebAudioEngine | null
  state: PlayerState
  queue: Track[]
  currentIndex: number
  
  // 初始化
  initEngine: () => void
  
  // 播放控制
  play: (track: Track) => Promise<void>
  playQueue: (tracks: Track[], startIndex?: number) => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void
  seek: (position: number) => void
  
  // 队列控制
  next: () => Promise<void>
  previous: () => Promise<void>
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  
  // 音量控制
  setVolume: (volume: number) => void
  setMute: (muted: boolean) => void
  
  // 播放模式
  setRepeatMode: (mode: RepeatMode) => void
  setShuffle: (shuffle: boolean) => void
  
  // 均衡器
  setEqualizer: (bands: EqualizerBand[]) => void
  loadEqualizerPreset: (presetId: string) => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  engine: null,
  state: {
    status: 'stopped',
    currentTrack: null,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    repeatMode: 'none',
    shuffle: false,
  },
  queue: [],
  currentIndex: -1,

  initEngine: () => {
    const engine = new WebAudioEngine()
    
    engine.onStateChange((newState) => {
      set({ state: newState })
    })
    
    set({ engine })
  },

  play: async (track: Track) => {
    const { engine, queue } = get()
    if (!engine) {
      get().initEngine()
      return get().play(track)
    }

    const index = queue.findIndex(t => t.id === track.id)
    if (index === -1) {
      set({ queue: [...queue, track], currentIndex: queue.length })
    } else {
      set({ currentIndex: index })
    }

    await engine.play(track)
  },

  playQueue: async (tracks: Track[], startIndex = 0) => {
    const { engine } = get()
    if (!engine) {
      get().initEngine()
      return get().playQueue(tracks, startIndex)
    }

    set({ queue: tracks, currentIndex: startIndex })
    await engine.play(tracks[startIndex])
  },

  pause: () => {
    const { engine } = get()
    engine?.pause()
  },

  resume: () => {
    const { engine } = get()
    engine?.resume()
  },

  stop: () => {
    const { engine } = get()
    engine?.stop()
  },

  seek: (position: number) => {
    const { engine } = get()
    engine?.seek(position)
  },

  next: async () => {
    const { engine, queue, currentIndex, state } = get()
    if (!engine || queue.length === 0) return

    let nextIndex: number
    if (state.shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length)
    } else if (state.repeatMode === 'all') {
      nextIndex = (currentIndex + 1) % queue.length
    } else {
      nextIndex = currentIndex + 1
    }

    if (nextIndex < queue.length) {
      set({ currentIndex: nextIndex })
      await engine.play(queue[nextIndex])
    }
  },

  previous: async () => {
    const { engine, queue, currentIndex, state } = get()
    if (!engine || queue.length === 0) return

    if (state.currentTime > 3) {
      engine.seek(0)
      return
    }

    let prevIndex: number
    if (state.shuffle) {
      prevIndex = Math.floor(Math.random() * queue.length)
    } else if (state.repeatMode === 'all') {
      prevIndex = (currentIndex - 1 + queue.length) % queue.length
    } else {
      prevIndex = currentIndex - 1
    }

    if (prevIndex >= 0) {
      set({ currentIndex: prevIndex })
      await engine.play(queue[prevIndex])
    }
  },

  addToQueue: (track: Track) => {
    const { queue } = get()
    set({ queue: [...queue, track] })
  },

  removeFromQueue: (index: number) => {
    const { queue, currentIndex } = get()
    const newQueue = queue.filter((_, i) => i !== index)
    let newIndex = currentIndex
    if (index < currentIndex) {
      newIndex = currentIndex - 1
    } else if (index === currentIndex) {
      newIndex = Math.min(currentIndex, newQueue.length - 1)
    }
    set({ queue: newQueue, currentIndex: newIndex })
  },

  clearQueue: () => {
    set({ queue: [], currentIndex: -1 })
  },

  setVolume: (volume: number) => {
    const { engine } = get()
    engine?.setVolume(volume)
  },

  setMute: (muted: boolean) => {
    const { engine } = get()
    engine?.setMute(muted)
  },

  setRepeatMode: (mode: RepeatMode) => {
    set((state) => ({
      state: { ...state.state, repeatMode: mode },
    }))
  },

  setShuffle: (shuffle: boolean) => {
    set((state) => ({
      state: { ...state.state, shuffle },
    }))
  },

  setEqualizer: (bands: EqualizerBand[]) => {
    const { engine } = get()
    engine?.setEqualizer(bands)
  },

  loadEqualizerPreset: (presetId: string) => {
    const { engine } = get()
    if (!engine) return
    const presets = engine.getEqualizerPresets()
    const preset = presets.find(p => p.id === presetId)
    if (preset) {
      engine.loadPreset(preset)
    }
  },
}))
```

- [ ] **Step 2: 创建播放列表 Store**

`apps/web/src/store/playlistStore.ts`:
```typescript
import { create } from 'zustand'
import { Playlist, Track } from '@music-flow/core'

interface PlaylistStore {
  playlists: Playlist[]
  currentPlaylist: Playlist | null
  
  // 播放列表操作
  createPlaylist: (name: string, description?: string) => Playlist
  deletePlaylist: (playlistId: string) => void
  renamePlaylist: (playlistId: string, name: string) => void
  
  // 歌曲操作
  addTrackToPlaylist: (playlistId: string, track: Track) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
  reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => void
  
  // 选择
  setCurrentPlaylist: (playlist: Playlist | null) => void
  getPlaylistById: (playlistId: string) => Playlist | undefined
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  currentPlaylist: null,

  createPlaylist: (name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: generateId(),
      name,
      description,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({
      playlists: [...state.playlists, newPlaylist],
    }))
    return newPlaylist
  },

  deletePlaylist: (playlistId: string) => {
    set((state) => ({
      playlists: state.playlists.filter(p => p.id !== playlistId),
      currentPlaylist: state.currentPlaylist?.id === playlistId 
        ? null 
        : state.currentPlaylist,
    }))
  },

  renamePlaylist: (playlistId: string, name: string) => {
    set((state) => ({
      playlists: state.playlists.map(p =>
        p.id === playlistId
          ? { ...p, name, updatedAt: new Date() }
          : p
      ),
    }))
  },

  addTrackToPlaylist: (playlistId: string, track: Track) => {
    set((state) => ({
      playlists: state.playlists.map(p => {
        if (p.id !== playlistId) return p
        if (p.tracks.some(t => t.trackId === track.id)) return p
        return {
          ...p,
          tracks: [
            ...p.tracks,
            {
              trackId: track.id,
              addedAt: new Date(),
              order: p.tracks.length,
            },
          ],
          updatedAt: new Date(),
        }
      }),
    }))
  },

  removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
    set((state) => ({
      playlists: state.playlists.map(p => {
        if (p.id !== playlistId) return p
        return {
          ...p,
          tracks: p.tracks.filter(t => t.trackId !== trackId),
          updatedAt: new Date(),
        }
      }),
    }))
  },

  reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => {
    set((state) => ({
      playlists: state.playlists.map(p => {
        if (p.id !== playlistId) return p
        const tracks = [...p.tracks]
        const [removed] = tracks.splice(fromIndex, 1)
        tracks.splice(toIndex, 0, removed)
        return {
          ...p,
          tracks: tracks.map((t, i) => ({ ...t, order: i })),
          updatedAt: new Date(),
        }
      }),
    }))
  },

  setCurrentPlaylist: (playlist: Playlist | null) => {
    set({ currentPlaylist: playlist })
  },

  getPlaylistById: (playlistId: string) => {
    return get().playlists.find(p => p.id === playlistId)
  },
}))
```

- [ ] **Step 3: 创建 Store 入口**

`apps/web/src/store/index.ts`:
```typescript
export { usePlayerStore } from './playerStore'
export { usePlaylistStore } from './playlistStore'
```

- [ ] **Step 4: 提交代码**

```bash
git add apps/web/src/store
git commit -m "feat: implement Zustand stores for player and playlist management"
```

---

## Task 5: UI 组件库

**Covers:** 基础 UI 组件

**Files:**
- Create: `packages/ui/src/Button.tsx`
- Create: `packages/ui/src/Slider.tsx`
- Create: `packages/ui/src/Card.tsx`
- Create: `packages/ui/src/index.ts`

- [ ] **Step 1: 创建 Button 组件**

`packages/ui/src/Button.tsx`:
```typescript
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-300 hover:bg-gray-800 focus:ring-gray-500',
  }
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
  }
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: 创建 Slider 组件**

`packages/ui/src/Slider.tsx`:
```typescript
import React, { useCallback, useRef, useState } from 'react'

interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  className?: string
}

export function Slider({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  className = '',
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const calculateValue = useCallback((clientX: number) => {
    if (!sliderRef.current) return value
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round((min + percent * (max - min)) / step) * step
  }, [min, max, step, value])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    const newValue = calculateValue(e.clientX)
    onChange(newValue)

    const handleMouseMove = (e: MouseEvent) => {
      const newValue = calculateValue(e.clientX)
      onChange(newValue)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [calculateValue, onChange])

  const percent = ((value - min) / (max - min)) * 100

  return (
    <div
      ref={sliderRef}
      className={`relative h-2 bg-gray-700 rounded-full cursor-pointer group ${className}`}
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute h-full bg-blue-500 rounded-full transition-colors group-hover:bg-blue-400"
        style={{ width: `${percent}%` }}
      />
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
          isDragging ? 'scale-125' : 'scale-0 group-hover:scale-100'
        }`}
        style={{ left: `${percent}%`, marginLeft: '-8px' }}
      />
    </div>
  )
}
```

- [ ] **Step 3: 创建 Card 组件**

`packages/ui/src/Card.tsx`:
```typescript
import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-gray-800 rounded-xl p-4 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-gray-700' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface CardImageProps {
  src: string
  alt: string
  className?: string
}

export function CardImage({ src, alt, className = '' }: CardImageProps) {
  return (
    <div className={`relative aspect-square rounded-lg overflow-hidden mb-3 ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
        }}
      />
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-white font-semibold truncate ${className}`}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-gray-400 text-sm truncate ${className}`}>
      {children}
    </p>
  )
}
```

- [ ] **Step 4: 创建 UI 包入口**

`packages/ui/src/index.ts`:
```typescript
export { Button } from './Button'
export { Slider } from './Slider'
export { Card, CardImage, CardTitle, CardDescription } from './Card'
```

- [ ] **Step 5: 提交代码**

```bash
git add packages/ui/src
git commit -m "feat: add UI component library with Button, Slider, and Card"
```

---

## Task 6: 播放器组件

**Covers:** 播放器 UI

**Files:**
- Create: `apps/web/src/components/Player/PlayerBar.tsx`
- Create: `apps/web/src/components/Player/PlayerControls.tsx`
- Create: `apps/web/src/components/Player/VolumeControl.tsx`
- Create: `apps/web/src/components/Player/ProgressBar.tsx`
- Create: `apps/web/src/components/Player/index.ts`

- [ ] **Step 1: 创建进度条组件**

`apps/web/src/components/Player/ProgressBar.tsx`:
```typescript
import { Slider } from '@music-flow/ui'
import { usePlayerStore } from '../../store'

export function ProgressBar() {
  const { state, seek } = usePlayerStore()
  const { currentTime, duration } = state

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-gray-400 w-10 text-right">
        {formatTime(currentTime)}
      </span>
      <Slider
        value={currentTime}
        min={0}
        max={duration || 100}
        onChange={seek}
        className="flex-1"
      />
      <span className="text-xs text-gray-400 w-10">
        {formatTime(duration)}
      </span>
    </div>
  )
}
```

- [ ] **Step 2: 创建音量控制组件**

`apps/web/src/components/Player/VolumeControl.tsx`:
```typescript
import { Slider } from '@music-flow/ui'
import { usePlayerStore } from '../../store'

export function VolumeControl() {
  const { state, setVolume, setMute } = usePlayerStore()
  const { volume, muted } = state

  const VolumeIcon = () => {
    if (muted || volume === 0) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      )
    }
    if (volume < 0.5) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )
    }
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setMute(!muted)}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <VolumeIcon />
      </button>
      <Slider
        value={muted ? 0 : volume}
        min={0}
        max={1}
        onChange={(value) => {
          if (muted) setMute(false)
          setVolume(value)
        }}
        className="w-24"
      />
    </div>
  )
}
```

- [ ] **Step 3: 创建播放控制组件**

`apps/web/src/components/Player/PlayerControls.tsx`:
```typescript
import { Button } from '@music-flow/ui'
import { usePlayerStore } from '../../store'

export function PlayerControls() {
  const { state, pause, resume, next, previous, setRepeatMode, setShuffle } = usePlayerStore()
  const { status, repeatMode, shuffle } = state

  const isPlaying = status === 'playing'

  const PlayIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )

  const PauseIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )

  const PreviousIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  )

  const NextIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  )

  const RepeatIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
    </svg>
  )

  const ShuffleIcon = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
    </svg>
  )

  const cycleRepeatMode = () => {
    const modes = ['none', 'all', 'one'] as const
    const currentIndex = modes.indexOf(repeatMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setRepeatMode(modes[nextIndex])
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShuffle(!shuffle)}
        className={shuffle ? 'text-green-500' : 'text-gray-400'}
      >
        <ShuffleIcon />
      </Button>
      
      <Button variant="ghost" size="sm" onClick={previous}>
        <PreviousIcon />
      </Button>
      
      <Button
        variant="primary"
        size="lg"
        onClick={isPlaying ? pause : resume}
        className="rounded-full w-12 h-12 p-0"
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </Button>
      
      <Button variant="ghost" size="sm" onClick={next}>
        <NextIcon />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={cycleRepeatMode}
        className={repeatMode !== 'none' ? 'text-green-500' : 'text-gray-400'}
      >
        <RepeatIcon />
        {repeatMode === 'one' && (
          <span className="absolute -top-1 -right-1 text-[10px] text-green-500">1</span>
        )}
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: 创建播放器栏组件**

`apps/web/src/components/Player/PlayerBar.tsx`:
```typescript
import { usePlayerStore } from '../../store'
import { PlayerControls } from './PlayerControls'
import { ProgressBar } from './ProgressBar'
import { VolumeControl } from './VolumeControl'

export function PlayerBar() {
  const { state } = usePlayerStore()
  const { currentTrack, status } = state

  if (status === 'stopped' && !currentTrack) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <ProgressBar />
        <div className="flex items-center justify-between mt-3">
          {/* 歌曲信息 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {currentTrack?.coverUrl && (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <div className="text-white font-medium truncate">
                {currentTrack?.title || '未播放'}
              </div>
              <div className="text-gray-400 text-sm truncate">
                {currentTrack?.artist || '未知艺术家'}
              </div>
            </div>
          </div>

          {/* 播放控制 */}
          <div className="flex-1 flex justify-center">
            <PlayerControls />
          </div>

          {/* 音量控制 */}
          <div className="flex-1 flex justify-end">
            <VolumeControl />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 创建 Player 模块入口**

`apps/web/src/components/Player/index.ts`:
```typescript
export { PlayerBar } from './PlayerBar'
export { PlayerControls } from './PlayerControls'
export { ProgressBar } from './ProgressBar'
export { VolumeControl } from './VolumeControl'
```

- [ ] **Step 6: 提交代码**

```bash
git add apps/web/src/components/Player
git commit -m "feat: implement player bar with controls, progress, and volume"
```

---

## Task 7: 歌曲列表与文件导入

**Covers:** 本地文件播放

**Files:**
- Create: `apps/web/src/components/TrackList/TrackList.tsx`
- Create: `apps/web/src/components/TrackList/TrackItem.tsx`
- Create: `apps/web/src/components/TrackList/FileImporter.tsx`
- Create: `apps/web/src/components/TrackList/index.ts`
- Create: `apps/web/src/services/fileService.ts`

- [ ] **Step 1: 创建文件服务**

`apps/web/src/services/fileService.ts`:
```typescript
import { Track, TrackMetadata } from '@music-flow/core'

export class FileService {
  static async importFiles(files: FileList): Promise<Track[]> {
    const tracks: Track[] = []
    
    for (const file of Array.from(files)) {
      if (!this.isAudioFile(file)) continue
      
      const track = await this.createTrackFromFile(file)
      tracks.push(track)
    }
    
    return tracks
  }

  static isAudioFile(file: File): boolean {
    const audioTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/flac',
      'audio/aac',
      'audio/mp4',
    ]
    return audioTypes.includes(file.type) || 
           file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i) !== null
  }

  static async createTrackFromFile(file: File): Promise<Track> {
    const url = URL.createObjectURL(file)
    const metadata = await this.extractMetadata(file)
    
    return {
      id: this.generateId(),
      title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
      artist: metadata.artist || '未知艺术家',
      album: metadata.album || '未知专辑',
      duration: metadata.duration || 0,
      coverUrl: metadata.coverUrl,
      source: 'local',
      sourceId: url,
      localPath: file.name,
      metadata: {
        format: this.getFormat(file.name),
        bitrate: metadata.bitrate,
        sampleRate: metadata.sampleRate,
        channels: metadata.channels,
      },
    }
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  private static getFormat(filename: string): TrackMetadata['format'] {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'mp3': return 'mp3'
      case 'flac': return 'flac'
      case 'wav': return 'wav'
      case 'ogg': return 'ogg'
      case 'aac':
      case 'm4a': return 'aac'
      default: return 'mp3'
    }
  }

  private static async extractMetadata(file: File): Promise<{
    title?: string
    artist?: string
    album?: string
    duration?: number
    coverUrl?: string
    bitrate?: number
    sampleRate?: number
    channels?: number
  }> {
    return new Promise((resolve) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      
      audio.addEventListener('loadedmetadata', () => {
        resolve({
          duration: audio.duration,
        })
        URL.revokeObjectURL(url)
      })
      
      audio.addEventListener('error', () => {
        resolve({})
        URL.revokeObjectURL(url)
      })
      
      audio.src = url
    })
  }

  static revokeUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }
}
```

- [ ] **Step 2: 创建文件导入组件**

`apps/web/src/components/TrackList/FileImporter.tsx`:
```typescript
import React, { useCallback, useRef } from 'react'
import { Button } from '@music-flow/ui'
import { FileService } from '../../services/fileService'
import { usePlayerStore } from '../../store'
import { Track } from '@music-flow/core'

interface FileImporterProps {
  onImport?: (tracks: Track[]) => void
}

export function FileImporter({ onImport }: FileImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToQueue } = usePlayerStore()

  const handleImport = useCallback(async (files: FileList) => {
    const tracks = await FileService.importFiles(files)
    
    tracks.forEach(track => addToQueue(track))
    
    if (onImport) {
      onImport(tracks)
    }
  }, [addToQueue, onImport])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleImport(files)
    }
  }, [handleImport])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImport(files)
    }
  }, [handleImport])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <div
      className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-gray-500 transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="mb-4">
        <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
      
      <p className="text-gray-400 mb-4">
        拖拽音乐文件到这里，或点击选择文件
      </p>
      
      <Button
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
      >
        选择文件
      </Button>
      
      <p className="text-gray-500 text-sm mt-3">
        支持 MP3, WAV, FLAC, OGG, AAC 格式
      </p>
    </div>
  )
}
```

- [ ] **Step 3: 创建歌曲项组件**

`apps/web/src/components/TrackList/TrackItem.tsx`:
```typescript
import { Track } from '@music-flow/core'
import { usePlayerStore } from '../../store'

interface TrackItemProps {
  track: Track
  index: number
  showIndex?: boolean
}

export function TrackItem({ track, index, showIndex = true }: TrackItemProps) {
  const { play, state } = usePlayerStore()
  const isCurrentTrack = state.currentTrack?.id === track.id
  const isPlaying = isCurrentTrack && state.status === 'playing'

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group ${
        isCurrentTrack ? 'bg-gray-800' : ''
      }`}
      onClick={() => play(track)}
    >
      {/* 序号/播放状态 */}
      {showIndex && (
        <div className="w-8 text-center">
          {isPlaying ? (
            <div className="flex items-center justify-center gap-0.5">
              <div className="w-1 h-3 bg-green-500 animate-pulse" />
              <div className="w-1 h-4 bg-green-500 animate-pulse delay-75" />
              <div className="w-1 h-2 bg-green-500 animate-pulse delay-150" />
            </div>
          ) : (
            <span className="text-gray-500 group-hover:hidden">{index + 1}</span>
          )}
          {!isPlaying && (
            <svg className="w-4 h-4 text-white hidden group-hover:block mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      )}

      {/* 封面 */}
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
        {track.coverUrl ? (
          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
      </div>

      {/* 歌曲信息 */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium truncate ${isCurrentTrack ? 'text-green-500' : 'text-white'}`}>
          {track.title}
        </div>
        <div className="text-gray-400 text-sm truncate">
          {track.artist}
        </div>
      </div>

      {/* 专辑 */}
      <div className="hidden md:block text-gray-400 text-sm flex-1 min-w-0 truncate">
        {track.album}
      </div>

      {/* 时长 */}
      <div className="text-gray-400 text-sm">
        {formatDuration(track.duration)}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 创建歌曲列表组件**

`apps/web/src/components/TrackList/TrackList.tsx`:
```typescript
import { Track } from '@music-flow/core'
import { TrackItem } from './TrackItem'

interface TrackListProps {
  tracks: Track[]
  showIndex?: boolean
}

export function TrackList({ tracks, showIndex = true }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <p>暂无歌曲</p>
        <p className="text-sm mt-1">导入音乐文件开始播放</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* 表头 */}
      {showIndex && (
        <div className="flex items-center gap-4 px-3 py-2 text-gray-500 text-sm border-b border-gray-800">
          <div className="w-8 text-center">#</div>
          <div className="w-10" />
          <div className="flex-1">标题</div>
          <div className="hidden md:block flex-1">专辑</div>
          <div className="w-16 text-right">时长</div>
        </div>
      )}
      
      {/* 歌曲列表 */}
      {tracks.map((track, index) => (
        <TrackItem
          key={track.id}
          track={track}
          index={index}
          showIndex={showIndex}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 5: 创建 TrackList 模块入口**

`apps/web/src/components/TrackList/index.ts`:
```typescript
export { TrackList } from './TrackList'
export { TrackItem } from './TrackItem'
export { FileImporter } from './FileImporter'
```

- [ ] **Step 6: 提交代码**

```bash
git add apps/web/src/components/TrackList apps/web/src/services/fileService.ts
git commit -m "feat: implement track list and file import functionality"
```

---

## Task 8: 布局与主页面

**Covers:** 应用布局

**Files:**
- Create: `apps/web/src/components/Layout/Layout.tsx`
- Create: `apps/web/src/components/Layout/Sidebar.tsx`
- Create: `apps/web/src/components/Layout/Header.tsx`
- Create: `apps/web/src/components/Layout/index.ts`
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/index.css`

- [ ] **Step 1: 创建侧边栏组件**

`apps/web/src/components/Layout/Sidebar.tsx`:
```typescript
import { usePlaylistStore } from '../../store'
import { Button } from '@music-flow/ui'

interface SidebarProps {
  onNavigate: (page: string) => void
  currentPage: string
}

export function Sidebar({ onNavigate, currentPage }: SidebarProps) {
  const { playlists, createPlaylist } = usePlaylistStore()

  const handleCreatePlaylist = () => {
    const name = prompt('请输入歌单名称')
    if (name) {
      createPlaylist(name)
    }
  }

  const menuItems = [
    { id: 'home', label: '首页', icon: '🏠' },
    { id: 'library', label: '音乐库', icon: '🎵' },
    { id: 'search', label: '搜索', icon: '🔍' },
  ]

  return (
    <div className="w-64 bg-gray-900 h-full flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">MusicFlow</h1>
      </div>

      {/* 主菜单 */}
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 播放列表 */}
        <div className="mt-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
              我的歌单
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreatePlaylist}
              className="text-gray-400 hover:text-white"
            >
              +
            </Button>
          </div>
          
          <div className="space-y-1">
            {playlists.map(playlist => (
              <button
                key={playlist.id}
                onClick={() => onNavigate(`playlist/${playlist.id}`)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === `playlist/${playlist.id}`
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-lg">📋</span>
                <span className="truncate">{playlist.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
```

- [ ] **Step 2: 创建头部组件**

`apps/web/src/components/Layout/Header.tsx`:
```typescript
interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      {subtitle && (
        <p className="text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: 创建布局组件**

`apps/web/src/components/Layout/Layout.tsx`:
```typescript
import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { PlayerBar } from '../Player'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <div className="h-screen flex bg-gray-950">
      {/* 侧边栏 */}
      <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto pb-24">
        <div className="p-8">
          {children}
        </div>
      </main>
      
      {/* 播放器栏 */}
      <PlayerBar />
    </div>
  )
}
```

- [ ] **Step 4: 创建 Layout 模块入口**

`apps/web/src/components/Layout/index.ts`:
```typescript
export { Layout } from './Layout'
export { Sidebar } from './Sidebar'
export { Header } from './Header'
```

- [ ] **Step 5: 更新 App.tsx**

`apps/web/src/App.tsx`:
```typescript
import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { FileImporter, TrackList } from './components/TrackList'
import { Header } from './components/Layout'
import { usePlayerStore } from './store'

function App() {
  const { queue, initEngine } = usePlayerStore()

  useEffect(() => {
    initEngine()
  }, [initEngine])

  return (
    <Layout>
      <Header 
        title="音乐库" 
        subtitle="导入本地音乐文件开始播放"
      />
      
      <div className="space-y-8">
        <FileImporter />
        
        {queue.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              已导入的歌曲 ({queue.length})
            </h2>
            <TrackList tracks={queue} />
          </div>
        )}
      </div>
    </Layout>
  )
}

export default App
```

- [ ] **Step 6: 更新全局样式**

`apps/web/src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #030712;
  --foreground: #ffffff;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--background);
  color: var(--foreground);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}

/* 动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.delay-75 {
  animation-delay: 75ms;
}

.delay-150 {
  animation-delay: 150ms;
}
```

- [ ] **Step 7: 启动开发服务器验证**

```bash
cd H:/vscode_project/music_balbal
pnpm dev
```

Expected: 应用在 http://localhost:3000 运行，显示完整的播放器界面

- [ ] **Step 8: 提交代码**

```bash
git add apps/web/src/App.tsx apps/web/src/index.css apps/web/src/components/Layout
git commit -m "feat: implement main layout with sidebar, header, and player bar"
```

---

## Task 9: 最终集成与测试

**Covers:** 集成测试

**Files:**
- Create: `apps/web/src/App.test.tsx`

- [ ] **Step 1: 编写集成测试**

`apps/web/src/App.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock Web Audio API
vi.mock('@music-flow/core', () => ({
  WebAudioEngine: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    setMute: vi.fn(),
    setEqualizer: vi.fn(),
    loadPreset: vi.fn(),
    getEqualizerPresets: vi.fn().mockReturnValue([]),
    getState: vi.fn().mockReturnValue({
      status: 'stopped',
      currentTrack: null,
      currentTime: 0,
      duration: 0,
      volume: 1,
      muted: false,
      repeatMode: 'none',
      shuffle: false,
    }),
    onStateChange: vi.fn().mockReturnValue(() => {}),
    destroy: vi.fn(),
  })),
}))

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('MusicFlow')).toBeInTheDocument()
  })

  it('renders the header', () => {
    render(<App />)
    expect(screen.getByText('音乐库')).toBeInTheDocument()
  })

  it('renders the file importer', () => {
    render(<App />)
    expect(screen.getByText('选择文件')).toBeInTheDocument()
  })

  it('renders sidebar navigation', () => {
    render(<App />)
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('音乐库')).toBeInTheDocument()
    expect(screen.getByText('搜索')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行完整测试套件**

```bash
cd H:/vscode_project/music_balbal
pnpm test
```

Expected: 所有测试通过

- [ ] **Step 3: 构建生产版本**

```bash
pnpm build
```

Expected: 构建成功，无错误

- [ ] **Step 4: 提交最终代码**

```bash
git add .
git commit -m "feat: complete MusicFlow Phase 1 MVP"
```

---

## 完成清单

- [ ] Monorepo 搭建完成
- [ ] 核心类型定义完成
- [ ] 音频引擎实现完成
- [ ] Zustand Store 实现完成
- [ ] UI 组件库完成
- [ ] 播放器组件完成
- [ ] 歌曲列表与文件导入完成
- [ ] 布局与主页面完成
- [ ] 集成测试通过
- [ ] 生产构建成功

---

**下一步：** 完成 Phase 1 后，继续 Phase 2 - 多端扩展（Tauri 桌面端 + Capacitor 移动端）
