// Service for managing local storage cache
import { Prompt } from '@/types'

// Extended cache duration for better performance
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

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

  // Selective cache update methods
  updatePromptInCache(promptId: string, updates: Partial<Prompt>): boolean {
    try {
      const authState = this.getAuthState()
      const cached = this.getPrompts(authState)
      
      if (!cached) return false
      
      const updatedPrompts = cached.map(prompt => 
        prompt._id === promptId 
          ? { ...prompt, ...updates }
          : prompt
      )
      
      this.savePrompts(updatedPrompts, authState)
      return true
    } catch (error) {
      console.error('Failed to update prompt in cache:', error)
      return false
    }
  },

  // Update multiple prompts at once
  updatePromptsInCache(updates: Array<{ id: string; updates: Partial<Prompt> }>): boolean {
    try {
      const authState = this.getAuthState()
      const cached = this.getPrompts(authState)
      
      if (!cached) return false
      
      const updateMap = new Map(updates.map(u => [u.id, u.updates]))
      
      const updatedPrompts = cached.map(prompt => {
        const promptUpdates = updateMap.get(prompt._id)
        return promptUpdates ? { ...prompt, ...promptUpdates } : prompt
      })
      
      this.savePrompts(updatedPrompts, authState)
      return true
    } catch (error) {
      console.error('Failed to update prompts in cache:', error)
      return false
    }
  },

  // Smart cache invalidation - only clear if major changes
  smartInvalidate(reason: 'like' | 'save' | 'rating' | 'comment' | 'major'): void {
    // Only clear cache for major changes (new prompts, deletions, etc.)
    if (reason === 'major') {
      this.clearPrompts()
    }
    // For minor changes (likes, saves, ratings), we use selective updates
  },

  // Get cache statistics for debugging
  getCacheStats(): { size: number; age: number; fresh: boolean } | null {
    try {
      const cached = localStorage.getItem('cachedPrompts')
      const cacheTime = localStorage.getItem('cachedPromptsTime')
      
      if (!cached || !cacheTime) return null
      
      const age = Date.now() - parseInt(cacheTime)
      const fresh = age < CACHE_DURATION
      
      return {
        size: JSON.parse(cached).length,
        age: Math.round(age / 1000), // in seconds
        fresh
      }
    } catch (error) {
      return null
    }
  }
}
