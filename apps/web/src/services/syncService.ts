import { authService } from './authService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export class SyncService {
  static async syncAll(): Promise<any> {
    const response = await authService.fetchWithAuth(`${API_URL}/api/sync/data`)
    if (!response.ok) throw new Error('Sync failed')
    return response.json()
  }

  static async syncPlaylists(playlists: any[]): Promise<void> {
    const response = await authService.fetchWithAuth(`${API_URL}/api/sync/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlists })
    })
    if (!response.ok) throw new Error('Playlist sync failed')
  }

  static async syncProgress(trackId: string, position: number): Promise<void> {
    const response = await authService.fetchWithAuth(`${API_URL}/api/sync/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId, position })
    })
    if (!response.ok) throw new Error('Progress sync failed')
  }
}
