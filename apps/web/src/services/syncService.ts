import { authService } from './authService'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '')
function endpoint(path: string): string {
  if (!API_URL) throw new Error('云端服务未配置')
  return API_URL + path
}

export class SyncService {
  static async syncAll(): Promise<any> {
    const response = await authService.fetchWithAuth(endpoint('/api/sync/data'))
    if (!response.ok) throw new Error('Sync failed')
    return response.json()
  }

  static async syncPlaylists(playlists: any[]): Promise<void> {
    const response = await authService.fetchWithAuth(endpoint('/api/sync/playlists'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlists })
    })
    if (!response.ok) throw new Error('Playlist sync failed')
  }

  static async syncProgress(trackId: string, position: number): Promise<void> {
    const response = await authService.fetchWithAuth(endpoint('/api/sync/progress'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId, position })
    })
    if (!response.ok) throw new Error('Progress sync failed')
  }
}
