import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PromptsResponse, Prompt } from '@/types'
import { promptService } from '@/services/prompt-service'

interface UsePromptsOptions {
  limit?: number
  category?: string
  agent?: string
}

export function usePrompts(options: UsePromptsOptions | number = 12) {
  const limit = typeof options === 'number' ? options : (options.limit || 12)
  const category = typeof options === 'object' ? options.category : undefined
  const agent = typeof options === 'object' ? options.agent : undefined
  
  const queryClient = useQueryClient()

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['prompts', limit, category, agent],
    queryFn: ({ pageParam = 1 }) => promptService.getAll(pageParam, limit, category, agent),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PromptsResponse) => {
      if (lastPage.pagination.page < lastPage.pagination.pages) {
        return lastPage.pagination.page + 1
      }
      return undefined
    },
  })

  // Flatten the pages into a single array of prompts
  const prompts = data?.pages.flatMap((page: PromptsResponse) => page.prompts) || []

  // Robust optimistic update helper
  // This updates the prompt across all active query variations (filtered, sorted, etc.)
  const updatePrompt = (promptId: string, updates: Partial<Prompt>) => {
    // 1. Snapshot the previous data (not strictly needed for basic optimistic updates but good practice)
    
    // 2. Optimistically update all queries that contain this prompt
    // We use setQueriesData to target all 'prompts' queries regardless of their specific filters
    queryClient.setQueriesData<any>({ queryKey: ['prompts'] }, (oldData: any) => {
      if (!oldData || !oldData.pages) return oldData
      
      return {
        ...oldData,
        pages: oldData.pages.map((page: PromptsResponse) => ({
          ...page,
          prompts: page.prompts.map((p) => 
            p._id === promptId ? { ...p, ...updates } : p
          )
        }))
      }
    })

    // 3. Also update the individual prompt query if it exists
    queryClient.setQueryData(['prompt', promptId], (oldData: Prompt | undefined) => {
        if (!oldData) return undefined
        return { ...oldData, ...updates }
    })
  }

  return {
    prompts,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refreshPrompts: refetch,
    updatePrompt,
    loadMore: fetchNextPage,
    hasMore: hasNextPage,
    isFetchingMore: isFetchingNextPage,
  }
}

/**
 * Hook for fetching a single prompt
 */
export function usePrompt(id: string) {
  return useQuery({
    queryKey: ['prompt', id],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/prompts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      if (!response.ok) throw new Error('Failed to fetch prompt')
      return response.json()
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for updating a prompt
 */
export function useUpdatePrompt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Prompt> }) => {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update prompt')
      return response.json()
    },
    onSuccess: (updatedPrompt, variables) => {
      // 1. Update individual prompt cache
      queryClient.setQueryData(['prompt', variables.id], updatedPrompt)
      
      // 2. Efficiently update all prompt lists (feeds, search results, etc.)
      // Instead of invalidating (refetching) all lists, we manually update the item in the cache.
      queryClient.setQueriesData<any>({ queryKey: ['prompts'] }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: PromptsResponse) => ({
            ...page,
            prompts: page.prompts.map((p) => 
              p._id === variables.id ? updatedPrompt : p
            )
          }))
        }
      })
      
      // 3. Also update user profile prompts if they exist in cache
      // The key for user prompts is typically ['user-prompts', userId]
      // Since we don't know the userId easily here without context, we can try to find it 
      // or just invalidate user-prompts to be safe, OR use setQueriesData with a fuzzy key.
      queryClient.setQueriesData<Prompt[]>({ queryKey: ['user-prompts'] }, (oldData: Prompt[] | undefined) => {
        if (!oldData) return oldData
        return oldData.map(p => p._id === variables.id ? updatedPrompt : p)
      })

      // Note: We still invalidate 'user-profile' generally if needed, but for simple edits
      // ensuring the prompt list is updated is usually sufficient.
    }
  })
}

/**
 * Hook for fetching user's saved prompts
 */
export function useSavedPrompts() {
  return useQuery({
    queryKey: ['saved-prompts'],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) return { prompts: [] }
      
      const response = await fetch('/api/user/saved-prompts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to fetch saved prompts')
      return response.json()
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  })
}

/**
 * Hook for creating a prompt
 */
export function useCreatePrompt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newPrompt: any) => {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/prompts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPrompt),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create prompt')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      // We might want to clear specific cache keys if we had them manually managed before
      localStorage.removeItem('cachedPrompts')
      localStorage.removeItem('cachedPromptsTime')
    }
  })
}

