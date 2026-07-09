import { create } from 'zustand'
import { Track, PlayerState, RepeatMode, EqualizerBand, EqualizerPreset } from '@music-flow/core'
import { WebAudioEngine } from '@music-flow/core'

interface PlayerStore {
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
    engine.onStateChange((newState: PlayerState) => set({ state: newState }))
    set({ engine })
  },

  play: async (track: Track) => {
    const { engine, queue } = get()
    if (!engine) { get().initEngine(); return get().play(track) }
    const index = queue.findIndex(t => t.id === track.id)
    if (index === -1) set({ queue: [...queue, track], currentIndex: queue.length })
    else set({ currentIndex: index })
    await engine.play(track)
  },

  playQueue: async (tracks: Track[], startIndex = 0) => {
    const { engine } = get()
    if (!engine) { get().initEngine(); return get().playQueue(tracks, startIndex) }
    set({ queue: tracks, currentIndex: startIndex })
    await engine.play(tracks[startIndex])
  },

  pause: () => { get().engine?.pause() },
  resume: () => { get().engine?.resume() },
  stop: () => { get().engine?.stop() },
  seek: (position: number) => { get().engine?.seek(position) },

  next: async () => {
    const { engine, queue, currentIndex, state } = get()
    if (!engine || queue.length === 0) return
    let nextIndex: number
    if (state.shuffle) nextIndex = Math.floor(Math.random() * queue.length)
    else if (state.repeatMode === 'all') nextIndex = (currentIndex + 1) % queue.length
    else nextIndex = currentIndex + 1
    if (nextIndex < queue.length) { set({ currentIndex: nextIndex }); await engine.play(queue[nextIndex]) }
  },

  previous: async () => {
    const { engine, queue, currentIndex, state } = get()
    if (!engine || queue.length === 0) return
    if (state.currentTime > 3) { engine.seek(0); return }
    let prevIndex: number
    if (state.shuffle) prevIndex = Math.floor(Math.random() * queue.length)
    else if (state.repeatMode === 'all') prevIndex = (currentIndex - 1 + queue.length) % queue.length
    else prevIndex = currentIndex - 1
    if (prevIndex >= 0) { set({ currentIndex: prevIndex }); await engine.play(queue[prevIndex]) }
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
  setRepeatMode: (mode: RepeatMode) => { set((state) => ({ state: { ...state.state, repeatMode: mode } })) },
  setShuffle: (shuffle: boolean) => { set((state) => ({ state: { ...state.state, shuffle } })) },
  setEqualizer: (bands: EqualizerBand[]) => { get().engine?.setEqualizer(bands) },
  loadEqualizerPreset: (presetId: string) => {
    const { engine } = get()
    if (!engine) return
    const presets = engine.getEqualizerPresets()
    const preset = presets.find((p: EqualizerPreset) => p.id === presetId)
    if (preset) engine.loadPreset(preset)
  },
}))
