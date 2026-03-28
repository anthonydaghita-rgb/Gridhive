import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'

interface AuthUser {
  id: string
  email: string
  name: string
}

interface AuthStore {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const result = await api.auth.login(email, password)
          set({ user: result.user, token: result.token ?? null, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true })
        try {
          const result = await api.auth.register(email, password, name)
          if (!result.token) {
            // Email already registered — better-auth returns token:null in this case
            set({ isLoading: false })
            throw new Error('An account with this email already exists. Please sign in instead.')
          }
          set({ user: result.user, token: result.token, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        await api.auth.logout().catch(() => {})
        set({ user: null, token: null })
      },

      checkAuth: async () => {
        try {
          const user = await api.auth.me()
          set({ user })
        } catch {
          set({ user: null, token: null })
        }
      },
    }),
    {
      name: 'gridhive-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
)
