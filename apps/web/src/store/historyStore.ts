import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Track } from '@music-flow/core'

interface HistoryEntry {
  track: Track
  playedAt: number
}

interface HistoryStore {
  history: HistoryEntry[]
  addToHistory: (track: Track) => void
  clearHistory: () => void
  getRecentTracks: (limit?: number) => Track[]
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      history: [],

      addToHistory: (track: Track) => {
        set((state) => {
          const filtered = state.history.filter((e) => e.track.id !== track.id)
          return {
            history: [{ track, playedAt: Date.now() }, ...filtered].slice(0, 100),
          }
        })
      },

      clearHistory: () => set({ history: [] }),

      getRecentTracks: (limit = 20) => {
        return get().history.slice(0, limit).map((e) => e.track)
      },
    }),
    { name: 'musicflow-history' }
  )
)
