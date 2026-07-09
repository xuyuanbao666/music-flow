import { create } from 'zustand'
import { SyncService } from '../services/syncService'
import { useAuthStore } from './authStore'

interface SyncStore {
  isSyncing: boolean
  lastSyncTime: Date | null
  error: string | null
  syncAll: () => Promise<void>
}

export const useSyncStore = create<SyncStore>((set) => ({
  isSyncing: false,
  lastSyncTime: null,
  error: null,
  syncAll: async () => {
    const { token } = useAuthStore.getState()
    if (!token) return
    set({ isSyncing: true, error: null })
    try {
      await SyncService.syncAll()
      set({ isSyncing: false, lastSyncTime: new Date() })
    } catch (error) {
      set({ error: (error as Error).message, isSyncing: false })
    }
  }
}))
