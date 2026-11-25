import { Track, TrackMetadata } from '@music-flow/core'
import { saveLocalTrack } from './libraryDb'

export class FileService {
  static async importFiles(files: FileList): Promise<Track[]> {
    const tracks: Track[] = []
    for (const file of Array.from(files)) {
      if (!this.isAudioFile(file)) continue
      const track = await this.createTrackFromFile(file)
      tracks.push(track)
    }
    return tracks
  }

  static isAudioFile(file: File): boolean {
    const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4']
    return audioTypes.includes(file.type) || file.name.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/i) !== null
  }

  static async createTrackFromFile(file: File): Promise<Track> {
    const metadata = await this.extractMetadata(file)
    const id = this.generateId()
    const track: Track = {
      id,
      title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
      artist: metadata.artist || '未知艺术家',
      album: metadata.album || '未知专辑',
      duration: metadata.duration || 0,
      coverUrl: metadata.coverUrl,
      source: 'local',
      sourceId: id,
      localPath: file.name,
      metadata: { format: this.getFormat(file.name), bitrate: metadata.bitrate, sampleRate: metadata.sampleRate, channels: metadata.channels },
    }
    await saveLocalTrack(track, file)
    return track
  }

  private static generateId(): string { return crypto.randomUUID() }

  private static getFormat(filename: string): TrackMetadata['format'] {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) { case 'mp3': return 'mp3'; case 'flac': return 'flac'; case 'wav': return 'wav'; case 'ogg': return 'ogg'; case 'aac': case 'm4a': return 'aac'; default: return 'mp3' }
  }

  private static async extractMetadata(file: File): Promise<{ title?: string; artist?: string; album?: string; duration?: number; coverUrl?: string; bitrate?: number; sampleRate?: number; channels?: number }> {
    return new Promise((resolve) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      let done = false
      const finish = (duration?: number) => {
        if (done) return
        done = true
        clearTimeout(timer)
        audio.removeAttribute('src')
        URL.revokeObjectURL(url)
        resolve(Number.isFinite(duration) ? { duration } : {})
      }
      const timer = setTimeout(() => finish(), 10000)
      audio.addEventListener('loadedmetadata', () => finish(audio.duration), { once: true })
      audio.addEventListener('error', () => finish(), { once: true })
      audio.preload = 'metadata'
      audio.src = url
    })
  }

  static revokeUrl(url: string): void { if (url.startsWith('blob:')) URL.revokeObjectURL(url) }
}
