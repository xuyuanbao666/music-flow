import { create } from 'zustand'
import { Track, PlayerState, RepeatMode, EqualizerBand, EqualizerPreset } from '@music-flow/core'
import { WebAudioEngine } from '@music-flow/core'

import { listLocalTracks, localTrackUrl } from '../services/libraryDb'

let playRequest = 0

interface PlayerStore {
  library: Track[]
  error: string | null
  restoreLibrary: () => Promise<void>
  addToLibrary: (track: Track) => void
  startTrack: (track: Track) => Promise<void>
  engine: WebAudioEngine | null
  state: PlayerState
  queue: Track[]
  currentIndex: number
  initEngine: () => void
  play: (track: Track) => Promise<void>
  playQueue: (tracks: Track[], startIndex?: number) => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void
  seek: (position: number) => void
  next: () => Promise<void>
  previous: () => Promise<void>
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  setVolume: (volume: number) => void
  setMute: (muted: boolean) => void
  setRepeatMode: (mode: RepeatMode) => void
  setShuffle: (shuffle: boolean) => void
  setEqualizer: (bands: EqualizerBand[]) => void
  loadEqualizerPreset: (presetId: string) => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  engine: null,
  library: [],
  error: null,
  restoreLibrary: async () => {
    try { const tracks = await listLocalTracks(); set(s => ({ library: [...new Map([...tracks, ...s.library].map(t => [t.id, t])).values()] })) }
    catch { set({ error: '无法读取本地音乐库' }) }
  },
  addToLibrary: track => set(s => ({ library: [...s.library.filter(t => t.id !== track.id), track] })),
  startTrack: async track => {
    const engine = get().engine
    if (!engine) return
    const request = ++playRequest
    set({ error: null })
    let url: string | undefined
    try {
      if (track.source === 'local') url = await localTrackUrl(track.id)
      if (request !== playRequest) { if (url) URL.revokeObjectURL(url); return }
      await engine.play(track, url)
      if (request === playRequest && engine.getState().status === 'error') set({ error: '歌曲无法播放，请检查音频格式或地址' })
    } catch (error) {
      if (url) URL.revokeObjectURL(url)
      if (request === playRequest) { engine.stop(); set({ error: error instanceof Error ? error.message : '播放失败' }) }
    }
  },
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
    if (get().engine) return
    const engine = new WebAudioEngine()
    engine.onStateChange((newState: PlayerState) => set({ state: newState }))
    engine.onTrackEnd(() => {
      get().next()
    })
    engine.setRepeatMode(get().state.repeatMode)
    engine.setShuffle(get().state.shuffle)
    set({ engine })
  },

  play: async (track: Track) => {
    const { engine, queue } = get()
    if (!engine) { get().initEngine(); return get().play(track) }
    const index = queue.findIndex(t => t.id === track.id)
    if (index === -1) set({ queue: [...queue, track], currentIndex: queue.length })
    else set({ currentIndex: index })
    await get().startTrack(track)
  },

  playQueue: async (tracks: Track[], startIndex = 0) => {
    const { engine } = get()
    if (!engine) { get().initEngine(); return get().playQueue(tracks, startIndex) }
    if (!Number.isInteger(startIndex) || startIndex < 0 || startIndex >= tracks.length) return
    set({ queue: tracks, currentIndex: startIndex })
    await get().startTrack(tracks[startIndex])
  },

  pause: () => { get().engine?.pause() },
  resume: () => { get().engine?.resume() },
  stop: () => { playRequest++; get().engine?.stop() },
  seek: (position: number) => { get().engine?.seek(position) },

  next: async () => {
    const { engine, queue, currentIndex, state } = get()
    if (!engine || queue.length === 0) return
    let nextIndex: number
    if (state.shuffle) nextIndex = queue.length === 1 ? 0 : (Math.max(0, currentIndex) + 1 + Math.floor(Math.random() * (queue.length - 1))) % queue.length
    else if (state.repeatMode === 'all') nextIndex = (currentIndex + 1) % queue.length
    else nextIndex = currentIndex + 1
    if (nextIndex < queue.length) { set({ currentIndex: nextIndex }); await get().startTrack(queue[nextIndex]) }
  },

  previous: async () => {
    const { engine, queue, currentIndex, state } = get()
    if (!engine || queue.length === 0) return
    if (state.currentTime > 3) { engine.seek(0); return }
    let prevIndex: number
    if (state.shuffle) prevIndex = queue.length === 1 ? 0 : (Math.max(0, currentIndex) + 1 + Math.floor(Math.random() * (queue.length - 1))) % queue.length
    else if (state.repeatMode === 'all') prevIndex = (currentIndex - 1 + queue.length) % queue.length
    else prevIndex = currentIndex - 1
    if (prevIndex >= 0) { set({ currentIndex: prevIndex }); await get().startTrack(queue[prevIndex]) }
  },

  addToQueue: (track: Track) => { set((state) => ({ queue: [...state.queue, track] })) },
  removeFromQueue: (index: number) => {
    const { queue, currentIndex } = get()
    const newQueue = queue.filter((_, i) => i !== index)
    let newIndex = currentIndex
    if (index < currentIndex) newIndex = currentIndex - 1
    else if (index === currentIndex) newIndex = Math.min(currentIndex, newQueue.length - 1)
    set({ queue: newQueue, currentIndex: newIndex })
  },
  clearQueue: () => { set({ queue: [], currentIndex: -1 }) },

  setVolume: (volume: number) => { get().engine?.setVolume(volume) },
  setMute: (muted: boolean) => { get().engine?.setMute(muted) },
  setRepeatMode: (mode: RepeatMode) => {
    const { engine } = get()
    if (engine) {
      engine.setRepeatMode(mode)
    }
    set((state) => ({ state: { ...state.state, repeatMode: mode } }))
  },
  setShuffle: (shuffle: boolean) => {
    const { engine } = get()
    if (engine) {
      engine.setShuffle(shuffle)
    }
    set((state) => ({ state: { ...state.state, shuffle } }))
  },
  setEqualizer: (bands: EqualizerBand[]) => { get().engine?.setEqualizer(bands) },
  loadEqualizerPreset: (presetId: string) => {
    const { engine } = get()
    if (!engine) return
    const presets = engine.getEqualizerPresets()
    const preset = presets.find((p: EqualizerPreset) => p.id === presetId)
    if (preset) engine.loadPreset(preset)
  },
}))
