import { Track } from '../../types'
import { MusicSource, SearchResult } from '../MusicSource'

export class NeteaseAdapter implements MusicSource {
  id = 'netease'
  name = '网易云音乐'
  type = 'api' as const

  private baseUrl: string

  constructor(baseUrl: string = 'https://api.example.com/netease') {
    this.baseUrl = baseUrl
  }

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?keywords=${encodeURIComponent(query)}`)
      if (!response.ok) return []
      const data = await response.json()

      return (data.result?.songs || []).map((song: any) => ({
        id: `netease-${song.id}`,
        title: song.name,
        artist: song.artists?.map((a: any) => a.name).join(', ') || '未知艺术家',
        album: song.album?.name || '未知专辑',
        duration: (song.duration || 0) / 1000,
        coverUrl: song.album?.picUrl,
        source: this.id,
        sourceId: String(song.id)
      }))
    } catch (error) {
      console.error('Netease search error:', error)
      return []
    }
  }

  async getTrack(trackId: string): Promise<Track> {
    return {
      id: `netease-${trackId}`,
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
    const response = await fetch(`${this.baseUrl}/song/url?id=${trackId}`)
    const data = await response.json()
    return data.data?.[0]?.url || ''
  }
}
