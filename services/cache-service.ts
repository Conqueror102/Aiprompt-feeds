// Service for managing local storage cache
import { Prompt } from '@/types'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const cacheService = {
  savePrompts(prompts: Prompt[], authState: string): void {
    try {
      localStorage.setItem('cachedPrompts', JSON.stringify(prompts))
      localStorage.setItem('cachedPromptsTime', Date.now().toString())
      localStorage.setItem('cachedPromptsAuth', authState)
    } catch (error) {
      console.error('Failed to cache prompts:', error)
    }
  },

  getPrompts(authState: string): Prompt[] | null {
    try {
      const cached = localStorage.getItem('cachedPrompts')
      const cacheTime = localStorage.getItem('cachedPromptsTime')
      const cachedAuth = localStorage.getItem('cachedPromptsAuth') || 'anon'

      if (!cached || !cacheTime) return null

      const isCacheFresh = 
        Date.now() - parseInt(cacheTime) < CACHE_DURATION && 
        cachedAuth === authState

      return isCacheFresh ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Failed to retrieve cached prompts:', error)
      return null
    }
  },

  clearPrompts(): void {
    try {
      localStorage.removeItem('cachedPrompts')
      localStorage.removeItem('cachedPromptsTime')
      localStorage.removeItem('cachedPromptsAuth')
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  },

  getAuthState(): string {
    return localStorage.getItem('token') || 'anon'
  },
}
