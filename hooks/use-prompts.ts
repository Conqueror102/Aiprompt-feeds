// Custom hook for managing prompts state and operations
import { useState, useEffect } from 'react'
import { Prompt } from '@/types'
import { promptService } from '@/services/prompt-service'
import { cacheService } from '@/services/cache-service'

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrompts = async () => {
    setLoading(true)
    setError(null)

    try {
      const authState = cacheService.getAuthState()
      const cachedPrompts = cacheService.getPrompts(authState)

      if (cachedPrompts) {
        setPrompts(cachedPrompts)
        setLoading(false)
        return
      }

      const data = await promptService.getAll()
      setPrompts(data)
      cacheService.savePrompts(data, authState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts')
      console.error('Failed to fetch prompts:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshPrompts = () => {
    cacheService.clearPrompts()
    fetchPrompts()
  }

  useEffect(() => {
    fetchPrompts()
  }, [])

  return {
    prompts,
    loading,
    error,
    refreshPrompts,
    setPrompts,
  }
}
