# MusicFlow Phase 4 - 高级功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现均衡器、音频可视化、歌词显示等高级功能。

**Architecture:** 基于Web Audio API的均衡器和可视化，LRC歌词解析和同步显示。

**Tech Stack:** Web Audio API, Canvas API, LRC Parser

---

## Task 1: 均衡器 UI

**Files:**
- Create: `apps/web/src/components/Equalizer/EqualizerPanel.tsx`
- Create: `apps/web/src/components/Equalizer/index.ts`

- [ ] **Step 1: 实现均衡器面板**

创建10段均衡器UI，支持预设选择和自定义调节。

- [ ] **Step 2: 提交代码**

```bash
git add apps/web/src/components/Equalizer && git commit -m "feat: add equalizer panel UI"
```

---

## Task 2: 音频可视化

**Files:**
- Create: `apps/web/src/components/Visualizer/AudioVisualizer.tsx`
- Create: `apps/web/src/components/Visualizer/index.ts`

- [ ] **Step 1: 实现音频可视化组件**

使用Canvas API和Web Audio API的AnalyserNode实现实时频谱可视化。

- [ ] **Step 2: 提交代码**

```bash
git add apps/web/src/components/Visualizer && git commit -m "feat: add audio spectrum visualizer"
```

---

## Task 3: 歌词显示

**Files:**
- Create: `packages/core/src/lyrics/LrcParser.ts`
- Create: `apps/web/src/components/Lyrics/LyricsPanel.tsx`
- Create: `apps/web/src/components/Lyrics/index.ts`

- [ ] **Step 1: 实现 LRC 解析器和歌词面板**

解析LRC格式歌词，实现逐行同步显示。

- [ ] **Step 2: 提交代码**

```bash
git add packages/core/src/lyrics apps/web/src/components/Lyrics && git commit -m "feat: add LRC lyrics parser and display"
```

---

## Task 4: 最终集成

- [ ] **Step 1: 验证所有功能**

运行开发服务器，测试所有新功能。

- [ ] **Step 2: 提交并推送**

```bash
git add . && git commit -m "feat: complete Phase 3 & 4 - advanced features"
git push
```
