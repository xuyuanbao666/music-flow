import { create } from 'zustand'
import { SourceManager, SearchResult } from '@music-flow/core'
import { NeteaseAdapter } from '@music-flow/core'

const sourceManager = new SourceManager()
const sourceUrl = import.meta.env.VITE_NETEASE_API_URL
if (sourceUrl) sourceManager.registerSource(new NeteaseAdapter(sourceUrl))

interface SearchStore {
  query: string
  results: SearchResult[]
  isSearching: boolean
  error: string | null
  setQuery: (query: string) => void
  search: () => Promise<void>
  resolvePlayUrl: (result: SearchResult) => Promise<string>
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  results: [],
  isSearching: false,
  error: null,
  setQuery: (query: string) => set({ query }),
  resolvePlayUrl: async result => {
    const source = sourceManager.getSource(result.source)
    if (!source) throw new Error('音源未配置')
    const url = await source.getPlayUrl(result.sourceId)
    if (!url || !/^https?:\/\//i.test(url)) throw new Error('当前歌曲没有可用的播放地址')
    return url
  },
  search: async () => {
    const { query } = get()
    if (!query.trim()) return
    if (sourceManager.getAllSources().length === 0) { set({ error: '在线音源未配置，请先导入本地音乐', results: [] }); return }
    set({ isSearching: true, error: null })
    try {
      const results = await sourceManager.searchAll(query)
      set({ results, isSearching: false })
    } catch (error) {
      set({ error: (error as Error).message, isSearching: false })
    }
  }
}))
