# MusicFlow Phase 2 - 多端扩展实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Web 应用扩展到 Tauri 桌面端和 Capacitor 移动端，实现基础云同步和用户认证。

**Architecture:** Tauri v2 封装 Web 应用为桌面端，Capacitor 6 封装为移动端。后端使用 Node.js + Hono 提供 API，PostgreSQL 存储数据。

**Tech Stack:** Tauri v2, Capacitor 6, Node.js, Hono, PostgreSQL, JWT, bcrypt

---

## Task 1: Tauri 桌面端集成

**Covers:** 桌面端打包

**Files:**
- Create: `apps/desktop/` (Tauri 项目)
- Modify: `pnpm-workspace.yaml`

- [ ] **Step 1: 创建 Tauri 桌面应用**

```bash
cd H:/vscode_project/music_balbal/apps
pnpm create tauri-app desktop --template react-ts
```

- [ ] **Step 2: 配置 Tauri**

更新 `apps/desktop/tauri.conf.json`:
```json
{
  "build": {
    "beforeDevCommand": "pnpm dev:web",
    "devUrl": "http://localhost:3000",
    "beforeBuildCommand": "pnpm build:web",
    "frontendDist": "../web/dist"
  },
  "app": {
    "title": "MusicFlow",
    "windows": [
      {
        "title": "MusicFlow - 高音质音乐播放器",
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

- [ ] **Step 3: 添加桌面端脚本**

更新 `apps/desktop/package.json`:
```json
{
  "name": "@music-flow/desktop",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "tauri dev",
    "dev:web": "cd ../web && pnpm dev",
    "build": "tauri build",
    "build:web": "cd ../web && pnpm build"
  },
  "dependencies": {
    "@music-flow/core": "workspace:*",
    "@music-flow/ui": "workspace:*",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 4: 更新 pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 5: 测试桌面端开发模式**

```bash
cd apps/desktop
pnpm dev
```

Expected: Tauri 窗口打开，显示 MusicFlow 应用

- [ ] **Step 6: 提交代码**

```bash
git add apps/desktop pnpm-workspace.yaml
git commit -m "feat: add Tauri desktop app integration"
```

---

## Task 2: Capacitor 移动端集成

**Covers:** 移动端适配

**Files:**
- Create: `apps/mobile/` (Capacitor 项目)

- [ ] **Step 1: 创建 Capacitor 项目**

```bash
cd H:/vscode_project/music_balbal
mkdir apps/mobile
cd apps/mobile
pnpm init
```

- [ ] **Step 2: 配置 Capacitor**

`apps/mobile/capacitor.config.ts`:
```typescript
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.musicflow.app',
  appName: 'MusicFlow',
  webDir: '../web/dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#030712',
      showSpinner: true,
      spinnerColor: '#3b82f6'
    }
  }
}

export default config
```

- [ ] **Step 3: 添加移动端脚本**

`apps/mobile/package.json`:
```json
{
  "name": "@music-flow/mobile",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build:web": "cd ../web && pnpm build",
    "cap:init": "cap init",
    "cap:add:android": "cap add android",
    "cap:add:ios": "cap add ios",
    "cap:sync": "cap sync",
    "cap:open:android": "cap open android",
    "cap:open:ios": "cap open ios"
  },
  "dependencies": {
    "@capacitor/android": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/ios": "^6.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0"
  }
}
```

- [ ] **Step 4: 添加 Android 平台**

```bash
cd apps/mobile
pnpm build:web
pnpm cap:add:android
pnpm cap:sync
```

- [ ] **Step 5: 提交代码**

```bash
git add apps/mobile
git commit -m "feat: add Capacitor mobile app with Android support"
```

---

## Task 3: 后端 API 服务搭建

**Covers:** 云同步基础设施

**Files:**
- Create: `services/api/` (后端服务)

- [ ] **Step 1: 创建后端项目结构**

```bash
cd H:/vscode_project/music_balbal
mkdir -p services/api
cd services/api
pnpm init
```

- [ ] **Step 2: 配置后端项目**

`services/api/package.json`:
```json
{
  "name": "@music-flow/api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@hono/node-server": "^1.11.0",
    "hono": "^4.4.0",
    "@prisma/client": "^5.15.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.14.0",
    "prisma": "^5.15.0",
    "tsx": "^4.15.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 3: 创建 Prisma Schema**

`services/api/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  playlists        Playlist[]
  playbackProgress PlaybackProgress[]
  equalizerSettings EqualizerSettings?
  playHistory      PlayHistory[]
  favorites        Favorite[]
}

model Track {
  id        String   @id @default(cuid())
  title     String
  artist    String?
  album     String?
  duration  Float?
  coverUrl  String?
  source    String
  sourceId  String
  localPath String?
  metadata  Json?
  createdAt DateTime @default(now())

  playlistTracks    PlaylistTrack[]
  playbackProgress  PlaybackProgress[]
  playHistory       PlayHistory[]
  favorites         Favorite[]

  @@unique([source, sourceId])
}

model Playlist {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user   User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  tracks PlaylistTrack[]

  @@index([userId])
}

model PlaylistTrack {
  playlistId String
  trackId    String
  addedAt    DateTime @default(now())
  order      Int

  playlist Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  track    Track    @relation(fields: [trackId], references: [id], onDelete: Cascade)

  @@id([playlistId, trackId])
  @@index([playlistId])
}

model PlaybackProgress {
  userId    String
  trackId   String
  position  Float
  updatedAt DateTime @updatedAt

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  track Track @relation(fields: [trackId], references: [id], onDelete: Cascade)

  @@id([userId, trackId])
}

model EqualizerSettings {
  userId   String @id
  bands    Json
  preset   String?
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PlayHistory {
  id       String   @id @default(cuid())
  userId   String
  trackId  String
  playedAt DateTime @default(now())
  duration Float?

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  track Track @relation(fields: [trackId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([playedAt])
}

model Favorite {
  userId   String
  trackId  String
  addedAt  DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  track Track @relation(fields: [trackId], references: [id], onDelete: Cascade)

  @@id([userId, trackId])
}
```

- [ ] **Step 4: 创建环境配置**

`services/api/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/musicflow"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=4000
```

- [ ] **Step 5: 创建 API 入口**

`services/api/src/index.ts`:
```typescript
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { PrismaClient } from '@prisma/client'

const app = new Hono()
const prisma = new PrismaClient()

// CORS
app.use('*', cors({
  origin: ['http://localhost:3000', 'tauri://localhost'],
  credentials: true
}))

// JWT 中间件（保护需要认证的路由）
app.use('/api/*', async (c, next) => {
  if (c.req.path === '/api/auth/login' || c.req.path === '/api/auth/register') {
    return next()
  }
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  // 简化的 JWT 验证，实际应使用 jose 或 jsonwebtoken
  return next()
})

// 健康检查
app.get('/health', (c) => c.json({ status: 'ok' }))

// 认证路由
app.post('/api/auth/register', async (c) => {
  const { email, name, password } = await c.req.json()
  // TODO: 实现注册逻辑
  return c.json({ message: 'Register endpoint' })
})

app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  // TODO: 实现登录逻辑
  return c.json({ message: 'Login endpoint' })
})

// 播放列表路由
app.get('/api/playlists', async (c) => {
  // TODO: 获取用户播放列表
  return c.json({ playlists: [] })
})

app.post('/api/playlists', async (c) => {
  // TODO: 创建播放列表
  return c.json({ message: 'Create playlist endpoint' })
})

// 播放进度路由
app.get('/api/progress/:trackId', async (c) => {
  // TODO: 获取播放进度
  return c.json({ position: 0 })
})

app.put('/api/progress/:trackId', async (c) => {
  // TODO: 更新播放进度
  return c.json({ message: 'Update progress endpoint' })
})

// 启动服务器
const port = Number(process.env.PORT) || 4000
console.log(`🎵 MusicFlow API running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
```

- [ ] **Step 6: 创建 TypeScript 配置**

`services/api/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 7: 提交代码**

```bash
git add services/api
git commit -m "feat: add backend API service with Hono and Prisma"
```

---

## Task 4: 用户认证系统

**Covers:** 用户认证

**Files:**
- Modify: `services/api/src/index.ts`
- Create: `services/api/src/auth.ts`
- Create: `apps/web/src/services/authService.ts`
- Create: `apps/web/src/store/authStore.ts`

- [ ] **Step 1: 实现认证服务**

`services/api/src/auth.ts`:
```typescript
import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export const authRoutes = new Hono()

authRoutes.post('/register', async (c) => {
  try {
    const { email, name, password } = await c.req.json()

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return c.json({ error: 'Email already exists' }, 400)
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword }
    })

    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

    return c.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    })
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500)
  }
})

authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    // 查找用户
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

    return c.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    })
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})
```

- [ ] **Step 2: 创建前端认证服务**

`apps/web/src/services/authService.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

interface User {
  id: string
  email: string
  name: string
}

interface AuthResponse {
  user: User
  token: string
}

export class AuthService {
  private static token: string | null = localStorage.getItem('token')

  static async register(email: string, name: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }

    const data: AuthResponse = await response.json()
    this.setToken(data.token)
    return data
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data: AuthResponse = await response.json()
    this.setToken(data.token)
    return data
  }

  static logout(): void {
    localStorage.removeItem('token')
    this.token = null
  }

  static getToken(): string | null {
    return this.token
  }

  static isAuthenticated(): boolean {
    return !!this.token
  }

  private static setToken(token: string): void {
    localStorage.setItem('token', token)
    this.token = token
  }

  static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken()
    if (!token) throw new Error('Not authenticated')

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    })
  }
}
```

- [ ] **Step 3: 创建认证 Store**

`apps/web/src/store/authStore.ts`:
```typescript
import { create } from 'zustand'
import { AuthService } from '../services/authService'

interface User {
  id: string
  email: string
  name: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: AuthService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const { user } = await AuthService.login(email, password)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  register: async (email: string, name: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const { user } = await AuthService.register(email, name, password)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  logout: () => {
    AuthService.logout()
    set({ user: null, isAuthenticated: false })
  },

  clearError: () => set({ error: null })
}))
```

- [ ] **Step 4: 提交代码**

```bash
git add services/api/src/auth.ts apps/web/src/services/authService.ts apps/web/src/store/authStore.ts
git commit -m "feat: implement user authentication system"
```

---

## Task 5: 云同步 API

**Covers:** 数据同步

**Files:**
- Create: `services/api/src/sync.ts`
- Create: `apps/web/src/services/syncService.ts`
- Create: `apps/web/src/store/syncStore.ts`

- [ ] **Step 1: 实现同步 API**

`services/api/src/sync.ts`:
```typescript
import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const syncRoutes = new Hono()

// 获取用户数据
syncRoutes.get('/data', async (c) => {
  const userId = c.req.header('X-User-Id') || 'default'

  const [playlists, progress, settings, history, favorites] = await Promise.all([
    prisma.playlist.findMany({
      where: { userId },
      include: { tracks: { orderBy: { order: 'asc' } } }
    }),
    prisma.playbackProgress.findMany({ where: { userId } }),
    prisma.equalizerSettings.findUnique({ where: { userId } }),
    prisma.playHistory.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: 100
    }),
    prisma.favorite.findMany({ where: { userId } })
  ])

  return c.json({ playlists, progress, settings, history, favorites })
})

// 同步播放列表
syncRoutes.post('/playlists', async (c) => {
  const userId = c.req.header('X-User-Id') || 'default'
  const { playlists } = await c.req.json()

  // 使用 upsert 操作
  for (const playlist of playlists) {
    await prisma.playlist.upsert({
      where: { id: playlist.id },
      update: {
        name: playlist.name,
        description: playlist.description,
        isPublic: playlist.isPublic,
        updatedAt: new Date()
      },
      create: {
        id: playlist.id,
        userId,
        name: playlist.name,
        description: playlist.description,
        isPublic: playlist.isPublic
      }
    })

    // 同步播放列表中的歌曲
    await prisma.playlistTrack.deleteMany({
      where: { playlistId: playlist.id }
    })

    if (playlist.tracks?.length > 0) {
      await prisma.playlistTrack.createMany({
        data: playlist.tracks.map((t: any, i: number) => ({
          playlistId: playlist.id,
          trackId: t.trackId,
          order: i,
          addedAt: new Date(t.addedAt)
        }))
      })
    }
  }

  return c.json({ success: true })
})

// 同步播放进度
syncRoutes.post('/progress', async (c) => {
  const userId = c.req.header('X-User-Id') || 'default'
  const { trackId, position } = await c.req.json()

  await prisma.playbackProgress.upsert({
    where: { userId_trackId: { userId, trackId } },
    update: { position, updatedAt: new Date() },
    create: { userId, trackId, position }
  })

  return c.json({ success: true })
})

// 同步均衡器设置
syncRoutes.post('/equalizer', async (c) => {
  const userId = c.req.header('X-User-Id') || 'default'
  const { bands, preset } = await c.req.json()

  await prisma.equalizerSettings.upsert({
    where: { userId },
    update: { bands, preset, updatedAt: new Date() },
    create: { userId, bands, preset }
  })

  return c.json({ success: true })
})

// 同步收藏
syncRoutes.post('/favorites', async (c) => {
  const userId = c.req.header('X-User-Id') || 'default'
  const { trackIds } = await c.req.json()

  // 先删除旧的收藏
  await prisma.favorite.deleteMany({ where: { userId } })

  // 添加新的收藏
  if (trackIds?.length > 0) {
    await prisma.favorite.createMany({
      data: trackIds.map((trackId: string) => ({
        userId,
        trackId,
        addedAt: new Date()
      }))
    })
  }

  return c.json({ success: true })
})
```

- [ ] **Step 2: 创建前端同步服务**

`apps/web/src/services/syncService.ts`:
```typescript
import { AuthService } from './authService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export class SyncService {
  static async syncAll(): Promise<any> {
    const response = await AuthService.fetchWithAuth(`${API_URL}/api/sync/data`)
    if (!response.ok) throw new Error('Sync failed')
    return response.json()
  }

  static async syncPlaylists(playlists: any[]): Promise<void> {
    const response = await AuthService.fetchWithAuth(`${API_URL}/api/sync/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlists })
    })
    if (!response.ok) throw new Error('Playlist sync failed')
  }

  static async syncProgress(trackId: string, position: number): Promise<void> {
    const response = await AuthService.fetchWithAuth(`${API_URL}/api/sync/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId, position })
    })
    if (!response.ok) throw new Error('Progress sync failed')
  }

  static async syncEqualizer(bands: any[], preset?: string): Promise<void> {
    const response = await AuthService.fetchWithAuth(`${API_URL}/api/sync/equalizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bands, preset })
    })
    if (!response.ok) throw new Error('Equalizer sync failed')
  }

  static async syncFavorites(trackIds: string[]): Promise<void> {
    const response = await AuthService.fetchWithAuth(`${API_URL}/api/sync/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackIds })
    })
    if (!response.ok) throw new Error('Favorites sync failed')
  }
}
```

- [ ] **Step 3: 创建同步 Store**

`apps/web/src/store/syncStore.ts`:
```typescript
import { create } from 'zustand'
import { SyncService } from '../services/syncService'
import { useAuthStore } from './authStore'
import { usePlaylistStore } from './playlistStore'
import { usePlayerStore } from './playerStore'

interface SyncStore {
  isSyncing: boolean
  lastSyncTime: Date | null
  error: string | null

  syncAll: () => Promise<void>
  syncPlaylists: () => Promise<void>
  syncProgress: (trackId: string, position: number) => Promise<void>
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  isSyncing: false,
  lastSyncTime: null,
  error: null,

  syncAll: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) return

    set({ isSyncing: true, error: null })
    try {
      const data = await SyncService.syncAll()

      // 同步播放列表
      if (data.playlists) {
        const { playlists } = usePlaylistStore.getState()
        // 合并远程和本地播放列表
        // TODO: 实现更智能的合并逻辑
      }

      set({ isSyncing: false, lastSyncTime: new Date() })
    } catch (error) {
      set({ error: (error as Error).message, isSyncing: false })
    }
  },

  syncPlaylists: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) return

    try {
      const { playlists } = usePlaylistStore.getState()
      await SyncService.syncPlaylists(playlists)
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  syncProgress: async (trackId: string, position: number) => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) return

    try {
      await SyncService.syncProgress(trackId, position)
    } catch (error) {
      console.error('Failed to sync progress:', error)
    }
  }
}))
```

- [ ] **Step 4: 提交代码**

```bash
git add services/api/src/sync.ts apps/web/src/services/syncService.ts apps/web/src/store/syncStore.ts
git commit -m "feat: implement cloud sync API and service"
```

---

## Task 6: 认证 UI 组件

**Covers:** 用户界面

**Files:**
- Create: `apps/web/src/components/Auth/LoginForm.tsx`
- Create: `apps/web/src/components/Auth/RegisterForm.tsx`
- Create: `apps/web/src/components/Auth/index.ts`
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: 创建登录表单**

`apps/web/src/components/Auth/LoginForm.tsx`:
```typescript
import React, { useState } from 'react'
import { Button } from '@music-flow/ui'
import { useAuthStore } from '../../store/authStore'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          登录 MusicFlow
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
            <button onClick={clearError} className="float-right">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm mb-2">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          还没有账号？{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-500 hover:text-blue-400"
          >
            注册
          </button>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建注册表单**

`apps/web/src/components/Auth/RegisterForm.tsx`:
```typescript
import React, { useState } from 'react'
import { Button } from '@music-flow/ui'
import { useAuthStore } from '../../store/authStore'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { register, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('密码不匹配')
      return
    }
    await register(email, name, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          注册 MusicFlow
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
            <button onClick={clearError} className="float-right">×</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm mb-2">用户名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="你的名字"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '注册中...' : '注册'}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          已有账号？{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-500 hover:text-blue-400"
          >
            登录
          </button>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 创建 Auth 模块入口**

`apps/web/src/components/Auth/index.ts`:
```typescript
export { LoginForm } from './LoginForm'
export { RegisterForm } from './RegisterForm'
```

- [ ] **Step 4: 更新 App.tsx 集成认证**

更新 `apps/web/src/App.tsx`:
```typescript
import { useState } from 'react'
import { Layout } from './components/Layout'
import { FileImporter, TrackList } from './components/TrackList'
import { Header } from './components/Layout'
import { LoginForm, RegisterForm } from './components/Auth'
import { usePlayerStore } from './store'
import { useAuthStore } from './store/authStore'

function App() {
  const { queue, initEngine } = usePlayerStore()
  const { isAuthenticated } = useAuthStore()
  const [showLogin, setShowLogin] = useState(true)

  // 初始化音频引擎
  useState(() => { initEngine() })

  // 未认证时显示登录/注册页面
  if (!isAuthenticated) {
    return showLogin ? (
      <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
    ) : (
      <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
    )
  }

  return (
    <Layout>
      <Header title="音乐库" subtitle="导入本地音乐文件开始播放" />
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

- [ ] **Step 5: 提交代码**

```bash
git add apps/web/src/components/Auth apps/web/src/App.tsx
git commit -m "feat: add authentication UI with login and register forms"
```

---

## Task 7: 最终集成与测试

**Covers:** 集成测试

- [ ] **Step 1: 验证所有包编译通过**

```bash
cd H:/vscode_project/music_balbal
pnpm build
```

- [ ] **Step 2: 推送到 GitHub**

```bash
git add .
git commit -m "feat: complete Phase 2 - multi-platform support and cloud sync"
git push
```

---

## 完成清单

- [ ] Tauri 桌面端集成完成
- [ ] Capacitor 移动端集成完成
- [ ] 后端 API 服务搭建完成
- [ ] 用户认证系统完成
- [ ] 云同步 API 完成
- [ ] 认证 UI 组件完成
- [ ] 生产构建成功
- [ ] 推送到 GitHub
