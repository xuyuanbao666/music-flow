import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'

interface User {
  id: string
  email: string
  name: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { user, token } = await authService.login(email, password)
          set({ user, token, isLoading: false })
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
        }
      },

      register: async (email, name, password) => {
        set({ isLoading: true, error: null })
        try {
          const { user, token } = await authService.register(email, name, password)
          set({ user, token, isLoading: false })
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
        }
      },

      logout: () => set({ user: null, token: null, error: null }),

      clearError: () => set({ error: null }),
    }),
    { name: 'musicflow-auth' }
  )
)
