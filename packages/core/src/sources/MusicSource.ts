import { Track } from '../types'

export interface SearchResult {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl?: string
  source: string
  sourceId: string
}

export interface MusicSource {
  id: string
  name: string
  type: 'api' | 'subsonic' | 'local' | 'custom'
  search(query: string): Promise<SearchResult[]>
  getTrack(trackId: string): Promise<Track>
  getPlayUrl(trackId: string): Promise<string>
}
