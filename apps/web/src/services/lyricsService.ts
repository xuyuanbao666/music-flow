import { LrcParser, LyricLine, Track } from '@music-flow/core'

const CACHE_KEY = 'music-flow-lyrics-cache'

interface CachedLyrics {
  trackId: string
  lyrics: LyricLine[]
  rawLrc: string
  timestamp: number
}

export class LyricsService {
  private static cache: Map<string, CachedLyrics> = new Map()
  private static loaded = false

  private static loadCache(): void {
    if (this.loaded) return
    try {
      const stored = localStorage.getItem(CACHE_KEY)
      if (stored) {
        const entries: CachedLyrics[] = JSON.parse(stored)
        for (const entry of entries) {
          this.cache.set(entry.trackId, entry)
        }
      }
    } catch {
      // ignore corrupted cache
    }
    this.loaded = true
  }

  private static saveCache(): void {
    try {
      const entries = Array.from(this.cache.values())
      localStorage.setItem(CACHE_KEY, JSON.stringify(entries))
    } catch {
      // storage full, evict oldest
      const entries = Array.from(this.cache.values())
        .sort((a, b) => a.timestamp - b.timestamp)
      if (entries.length > 1) {
        this.cache.delete(entries[0].trackId)
        this.saveCache()
      }
    }
  }

  static getCachedLyrics(trackId: string): LyricLine[] | null {
    this.loadCache()
    const cached = this.cache.get(trackId)
    return cached?.lyrics ?? null
  }

  static getCachedRawLrc(trackId: string): string | null {
    this.loadCache()
    return this.cache.get(trackId)?.rawLrc ?? null
  }

  static setCachedLyrics(trackId: string, lrcContent: string): LyricLine[] {
    this.loadCache()
    const lyrics = LrcParser.parse(lrcContent)
    this.cache.set(trackId, {
      trackId,
      lyrics,
      rawLrc: lrcContent,
      timestamp: Date.now(),
    })
    this.saveCache()
    return lyrics
  }

  static parseLrc(lrcContent: string): LyricLine[] {
    return LrcParser.parse(lrcContent)
  }

  static async loadLyricsForTrack(track: Track): Promise<LyricLine[]> {
    const cached = this.getCachedLyrics(track.id)
    if (cached && cached.length > 0) return cached

    return []
  }

  static async loadFromFile(file: File): Promise<{ lyrics: LyricLine[]; raw: string }> {
    const text = await file.text()
    const lyrics = LrcParser.parse(text)
    return { lyrics, raw: text }
  }

  static clearCache(): void {
    this.cache.clear()
    localStorage.removeItem(CACHE_KEY)
  }
}
