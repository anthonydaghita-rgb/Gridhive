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
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const result = await api.auth.login(email, password)
          set({ user: result.user, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true })
        try {
          const result = await api.auth.register(email, password, name)
          set({ user: result.user, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        await api.auth.logout().catch(() => {})
        set({ user: null })
      },

      checkAuth: async () => {
        try {
          const user = await api.auth.me()
          set({ user })
        } catch {
          set({ user: null })
        }
      },
    }),
    {
      name: 'gridhive-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
