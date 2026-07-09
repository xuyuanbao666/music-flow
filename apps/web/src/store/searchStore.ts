import { create } from 'zustand'
import { SourceManager, SearchResult } from '@music-flow/core'
import { NeteaseAdapter } from '@music-flow/core'

const sourceManager = new SourceManager()
sourceManager.registerSource(new NeteaseAdapter())

interface SearchStore {
  query: string
  results: SearchResult[]
  isSearching: boolean
  error: string | null
  setQuery: (query: string) => void
  search: () => Promise<void>
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  results: [],
  isSearching: false,
  error: null,
  setQuery: (query: string) => set({ query }),
  search: async () => {
    const { query } = get()
    if (!query.trim()) return
    set({ isSearching: true, error: null })
    try {
      const results = await sourceManager.searchAll(query)
      set({ results, isSearching: false })
    } catch (error) {
      set({ error: (error as Error).message, isSearching: false })
    }
  }
}))
