import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Track } from '@music-flow/core'

interface FavoritesStore {
  favorites: Track[]
  addFavorite: (track: Track) => void
  removeFavorite: (trackId: string) => void
  isFavorite: (trackId: string) => boolean
  toggleFavorite: (track: Track) => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (track: Track) => {
        set((state) => {
          if (state.favorites.some((t) => t.id === track.id)) return state
          return { favorites: [track, ...state.favorites] }
        })
      },

      removeFavorite: (trackId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((t) => t.id !== trackId),
        }))
      },

      isFavorite: (trackId: string) => {
        return get().favorites.some((t) => t.id === trackId)
      },

      toggleFavorite: (track: Track) => {
        const { isFavorite, addFavorite, removeFavorite } = get()
        if (isFavorite(track.id)) {
          removeFavorite(track.id)
        } else {
          addFavorite(track)
        }
      },
    }),
    { name: 'musicflow-favorites' }
  )
)
