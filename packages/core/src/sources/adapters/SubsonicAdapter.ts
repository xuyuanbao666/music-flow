import { Track } from '../../types'
import { MusicSource, SearchResult } from '../MusicSource'

export class SubsonicAdapter implements MusicSource {
  id = 'subsonic'
  name = 'Subsonic'
  type = 'subsonic' as const

  private baseUrl: string
  private username: string
  private password: string

  constructor(baseUrl: string, username: string, password: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.username = username
    this.password = password
  }

  private getAuthParams(): string {
    const salt = Math.random().toString(36).substring(2, 15)
    const token = md5(this.password + salt)
    return `u=${this.username}&t=${token}&s=${salt}&v=1.16.1&c=musicflow`
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/rest/search2?${this.getAuthParams()}&query=${encodeURIComponent(query)}`
      )
      const data = await response.json()

      return (data['subsonic-response']?.searchResult2?.song || []).map((song: any) => ({
        id: `subsonic-${song.id}`,
        title: song.title,
        artist: song.artist || '未知艺术家',
        album: song.album || '未知专辑',
        duration: song.duration || 0,
        coverUrl: song.coverArt ? `${this.baseUrl}/rest/getCoverArt?${this.getAuthParams()}&id=${song.coverArt}` : undefined,
        source: this.id,
        sourceId: song.id
      }))
    } catch (error) {
      console.error('Subsonic search error:', error)
      return []
    }
  }

  async getTrack(trackId: string): Promise<Track> {
    return {
      id: `subsonic-${trackId}`,
      title: 'Unknown',
      artist: 'Unknown',
      album: 'Unknown',
      duration: 0,
      source: 'stream',
      sourceId: trackId,
      metadata: { format: 'mp3' }
    }
  }

  async getPlayUrl(trackId: string): Promise<string> {
    return `${this.baseUrl}/rest/stream?${this.getAuthParams()}&id=${trackId}`
  }
}

function md5(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16)
}
