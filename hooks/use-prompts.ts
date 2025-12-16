// Custom hook for managing prompts state and operations
import { useState, useEffect } from 'react'
import { Prompt } from '@/types'
import { promptService } from '@/services/prompt-service'
import { cacheService } from '@/services/cache-service'

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const fetchPrompts = async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setIsFetchingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      
      const limit = 12
      const data = await promptService.getAll(pageNum, limit)
      
      if (data.length < limit) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }

      if (isLoadMore) {
        setPrompts(prev => {
          // Deduplicate prompts just in case
          const newPrompts = data.filter(p => !prev.some(existing => existing._id === p._id))
          return [...prev, ...newPrompts]
        })
      } else {
        setPrompts(data)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts')
      console.error('Failed to fetch prompts:', err)
    } finally {
      setLoading(false)
      setIsFetchingMore(false)
    }
  }

  const loadMore = () => {
    if (!isFetchingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchPrompts(nextPage, true)
    }
  }

  const refreshPrompts = () => {
    setPage(1)
    setHasMore(true)
    cacheService.clearPrompts()
    fetchPrompts(1, false)
  }

  useEffect(() => {
    fetchPrompts(1, false)
  }, [])

  return {
    prompts,
    loading,
    error,
    refreshPrompts,
    setPrompts,
    loadMore,
    hasMore,
    isFetchingMore
  }
}
