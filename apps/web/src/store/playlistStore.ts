import { create } from 'zustand'
import { Playlist, Track } from '@music-flow/core'

interface PlaylistStore {
  playlists: Playlist[]
  currentPlaylist: Playlist | null
  createPlaylist: (name: string, description?: string) => Playlist
  deletePlaylist: (playlistId: string) => void
  renamePlaylist: (playlistId: string, name: string) => void
  addTrackToPlaylist: (playlistId: string, track: Track) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
  reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => void
  setCurrentPlaylist: (playlist: Playlist | null) => void
  getPlaylistById: (playlistId: string) => Playlist | undefined
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  currentPlaylist: null,

  createPlaylist: (name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: generateId(),
      name,
      description,
      tracks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({ playlists: [...state.playlists, newPlaylist] }))
    return newPlaylist
  },

  deletePlaylist: (playlistId: string) => {
    set((state) => ({
      playlists: state.playlists.filter(p => p.id !== playlistId),
      currentPlaylist: state.currentPlaylist?.id === playlistId ? null : state.currentPlaylist,
    }))
  },

  renamePlaylist: (playlistId: string, name: string) => {
    set((state) => ({
      playlists: state.playlists.map(p => p.id === playlistId ? { ...p, name, updatedAt: new Date() } : p),
    }))
  },

  addTrackToPlaylist: (playlistId: string, track: Track) => {
    set((state) => ({
      playlists: state.playlists.map(p => {
        if (p.id !== playlistId) return p
        if (p.tracks.some((t: { trackId: string }) => t.trackId === track.id)) return p
        return { ...p, tracks: [...p.tracks, { trackId: track.id, addedAt: new Date(), order: p.tracks.length }], updatedAt: new Date() }
      }),
    }))
  },

  removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
    set((state) => ({
      playlists: state.playlists.map(p => p.id === playlistId ? { ...p, tracks: p.tracks.filter((t: { trackId: string }) => t.trackId !== trackId), updatedAt: new Date() } : p),
    }))
  },

  reorderPlaylistTracks: (playlistId: string, fromIndex: number, toIndex: number) => {
    set((state) => ({
      playlists: state.playlists.map(p => {
        if (p.id !== playlistId) return p
        const tracks = [...p.tracks]
        const [removed] = tracks.splice(fromIndex, 1)
        tracks.splice(toIndex, 0, removed)
        return { ...p, tracks: tracks.map((t, i) => ({ ...t, order: i })), updatedAt: new Date() }
      }),
    }))
  },

  setCurrentPlaylist: (playlist: Playlist | null) => { set({ currentPlaylist: playlist }) },
  getPlaylistById: (playlistId: string) => get().playlists.find(p => p.id === playlistId),
}))
