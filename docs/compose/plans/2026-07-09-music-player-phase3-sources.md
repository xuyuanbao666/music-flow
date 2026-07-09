# MusicFlow Phase 3 - 音源扩展实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现多源音乐接入，支持第三方API、Subsonic和自定义音源。

**Architecture:** 统一音源抽象层，各音源实现适配器模式，通过SourceManager统一管理。

**Tech Stack:** TypeScript, Adapter Pattern

---

## Task 1: 音源抽象层

**Files:**
- Create: `packages/core/src/sources/MusicSource.ts`
- Create: `packages/core/src/sources/SourceManager.ts`
- Create: `packages/core/src/sources/index.ts`

- [ ] **Step 1: 创建音源接口和管理器**

创建统一的音源接口和管理器，支持多源搜索和播放。

- [ ] **Step 2: 提交代码**

```bash
git add packages/core/src/sources && git commit -m "feat: add music source abstraction layer"
```

---

## Task 2: 网易云音乐适配器

**Files:**
- Create: `packages/core/src/sources/adapters/NeteaseAdapter.ts`

- [ ] **Step 1: 实现网易云音乐适配器**

实现网易云音乐API适配器，支持搜索、获取歌曲URL等功能。

- [ ] **Step 2: 提交代码**

```bash
git add packages/core/src/sources/adapters && git commit -m "feat: add Netease Cloud Music adapter"
```

---

## Task 3: Subsonic 适配器

**Files:**
- Create: `packages/core/src/sources/adapters/SubsonicAdapter.ts`

- [ ] **Step 1: 实现 Subsonic 适配器**

实现Subsonic API适配器，支持自托管音乐服务器。

- [ ] **Step 2: 提交代码**

```bash
git add packages/core/src/sources/adapters && git commit -m "feat: add Subsonic adapter"
```

---

## Task 4: 搜索 UI 集成

**Files:**
- Create: `apps/web/src/components/Search/SearchPage.tsx`
- Create: `apps/web/src/store/searchStore.ts`

- [ ] **Step 1: 实现搜索页面和状态管理**

创建搜索页面，集成多源搜索功能。

- [ ] **Step 2: 提交代码**

```bash
git add apps/web/src && git commit -m "feat: add multi-source search UI"
```
