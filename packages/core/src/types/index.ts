export interface TrackMetadata {
  format: 'mp3' | 'flac' | 'wav' | 'ogg' | 'aac'
  bitrate?: number
  sampleRate?: number
  channels?: number
}

export interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverUrl?: string
  source: 'local' | 'stream' | 'url'
  sourceId: string
  localPath?: string
  metadata: TrackMetadata
}

export interface Playlist {
  id: string
  name: string
  description?: string
  tracks: PlaylistTrack[]
  createdAt: Date
  updatedAt: Date
}

export interface PlaylistTrack {
  trackId: string
  addedAt: Date
  order: number
}

export type PlaybackStatus = 'playing' | 'paused' | 'stopped' | 'loading' | 'error'

export interface PlayerState {
  status: PlaybackStatus
  currentTrack: Track | null
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  repeatMode: RepeatMode
  shuffle: boolean
}

export type RepeatMode = 'none' | 'one' | 'all'

export interface EqualizerBand {
  frequency: number
  gain: number
  type: 'lowshelf' | 'peaking' | 'highshelf'
}

export interface EqualizerPreset {
  id: string
  name: string
  bands: EqualizerBand[]
}

export interface PlayQueue {
  tracks: Track[]
  currentIndex: number
}
