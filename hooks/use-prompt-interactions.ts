// Custom hook for managing prompt likes and saves
import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { promptService } from '@/services/prompt-service'
import { toast } from '@/hooks/use-toast'
import { useBadgeChecker } from '@/hooks/use-badges'
import { PromptsResponse } from '@/types'

export function usePromptInteractions(userId?: string) {
  const queryClient = useQueryClient()
  const { checkAfterPromptLike, checkAfterPromptSave } = useBadgeChecker()

  // Fetch liked prompts
  const { data: likedPromptIds = new Set<string>() } = useQuery({
    queryKey: ['liked-prompts', userId],
    queryFn: async () => {
      if (!userId) return new Set<string>()
      const prompts = await promptService.getLikedPrompts()
      return new Set(prompts.map(p => p._id))
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch saved prompts
  const { data: savedPromptIds = new Set<string>() } = useQuery({
    queryKey: ['saved-prompts', userId],
    queryFn: async () => {
      if (!userId) return new Set<string>()
      const prompts = await promptService.getSavedPrompts()
      return new Set(prompts.map(p => p._id))
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  // Mixed loading state
  const loading = false // Queries handle their own loading, but for interactions we use mutation state

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: (promptId: string) => promptService.like(promptId),
    onMutate: async (promptId: string) => {
      if (!userId) {
        toast({ title: 'Sign in required', description: 'Please sign in to like prompts', variant: 'destructive' })
        throw new Error('Sign in required')
      }

      await queryClient.cancelQueries({ queryKey: ['liked-prompts', userId] })
      await queryClient.cancelQueries({ queryKey: ['prompts'] }) // Cancel feed queries

      const previousLiked = queryClient.getQueryData<Set<string>>(['liked-prompts', userId])
      const wasLiked = previousLiked?.has(promptId) ?? false

      // Optimistically update liked ID set
      queryClient.setQueryData<Set<string>>(['liked-prompts', userId], (old: Set<string> | undefined) => {
        const newSet = new Set(old)
        if (wasLiked) newSet.delete(promptId)
        else newSet.add(promptId)
        return newSet
      })

      // Optimistically update the feed (likes count) - targeting ALL prompt queries
      queryClient.setQueriesData<any>({ queryKey: ['prompts'] }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData
        // We need to traverse pages if it's an infinite query structure
        return {
          ...oldData,
          pages: oldData.pages.map((page: PromptsResponse) => ({
             ...page,
             prompts: page.prompts.map(p => {
               if (p._id === promptId) {
                 return { ...p, likes: Math.max(0, p.likes + (wasLiked ? -1 : 1)) }
               }
               return p
             })
          }))
        }
      })
        
      // Also update individual prompt query if exists
      queryClient.setQueryData(['prompt', promptId], (old: any) => {
          if (!old) return old
          return { ...old, likes: Math.max(0, old.likes + (wasLiked ? -1 : 1)) }
      })

      return { previousLiked }
    },
    onError: (err: Error, promptId: string, context: any) => {
      if (context?.previousLiked) {
        queryClient.setQueryData(['liked-prompts', userId], context.previousLiked)
      }
      // We might want to refetch 'prompts' here too to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
      queryClient.invalidateQueries({ queryKey: ['prompt', promptId] })
      
      if (err.message !== 'Sign in required') {
        toast({ title: 'Error', description: 'Failed to like prompt', variant: 'destructive' })
      }
    },
    onSuccess: () => {
      checkAfterPromptLike()
    },
    onSettled: () => {
       // Optional: refetch to ensure server sync
       // queryClient.invalidateQueries({ queryKey: ['liked-prompts', userId] })
    }
  })

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (promptId: string) => promptService.save(promptId),
    onMutate: async (promptId: string) => {
      if (!userId) {
        toast({ title: 'Sign in required', description: 'Please sign in to save prompts', variant: 'destructive' })
        throw new Error('Sign in required')
      }
      
      await queryClient.cancelQueries({ queryKey: ['saved-prompts', userId] })
      const previousSaved = queryClient.getQueryData<Set<string>>(['saved-prompts', userId])
      const wasSaved = previousSaved?.has(promptId) ?? false
      
      // Update Saved Set
      queryClient.setQueryData<Set<string>>(['saved-prompts', userId], (old: Set<string> | undefined) => {
        const newSet = new Set(old)
        if (wasSaved) newSet.delete(promptId)
        else newSet.add(promptId)
        return newSet
      })
      
      // Update prompt save count everywhere
      queryClient.setQueriesData<any>({ queryKey: ['prompts'] }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: PromptsResponse) => ({
             ...page,
             prompts: page.prompts.map(p => {
               if (p._id === promptId) {
                 return { ...p, saves: Math.max(0, p.saves + (wasSaved ? -1 : 1)) }
               }
               return p
             })
          }))
        }
      })
      
      return { previousSaved, wasSaved }
    },
    onError: (err: Error, promptId: string, context: any) => {
      if (context?.previousSaved) {
        queryClient.setQueryData(['saved-prompts', userId], context.previousSaved)
      }
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
      if (err.message !== 'Sign in required') {
        toast({ title: 'Error', description: 'Failed to save prompt', variant: 'destructive' })
      }
    },
    onSuccess: (data: any, promptId: string, context: any) => {
      checkAfterPromptSave()
      const wasSaved = context.wasSaved
       toast({
        title: wasSaved ? 'Removed from saved' : 'Saved!',
        description: wasSaved
          ? 'Prompt removed from your saved list'
          : 'Prompt saved to your collection',
      })
    }
  })

  // Rate Mutation
  const rateMutation = useMutation({
    mutationFn: ({ promptId, value }: { promptId: string, value: number }) => promptService.rate(promptId, value),
    onMutate: async ({ promptId, value }) => {
      if (!userId) {
        toast({ title: 'Sign in required', description: 'Please sign in to rate prompts', variant: 'destructive' })
        throw new Error('Sign in required')
      }
      
      // Update local cache optimistically
      queryClient.setQueryData(['rating', promptId, userId], { value })
      
      // Note: Updating the average rating optimistically is harder without knowing user's previous rating
      // We'll let the success handler update the average from the server response
    },
    onSuccess: (data, { promptId }) => {
      queryClient.setQueryData(['rating', promptId, userId], { value: data.average }) // Store result? No, store user rating
      
      // Update prompt average rating in all lists
      queryClient.setQueriesData<any>({ queryKey: ['prompts'] }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: PromptsResponse) => ({
             ...page,
             prompts: page.prompts.map(p => 
               p._id === promptId ? { ...p, rating: data.average } : p
             )
          }))
        }
      })
      
      queryClient.setQueryData(['prompt', promptId], (old: any) => {
          if (!old) return old
          return { ...old, rating: data.average }
      })
      
      toast({ title: 'Rated!', description: 'Thanks for your feedback' })
    },
    onError: (err) => {
       toast({ title: 'Error', description: 'Failed to submit rating', variant: 'destructive' })
    }
  })

  return {
    likedPromptIds,
    savedPromptIds,
    loading: likeMutation.isPending || saveMutation.isPending || rateMutation.isPending,
    toggleLike: async (id: string) => { 
        try { await likeMutation.mutateAsync(id); return true } catch { return false } 
    },
    toggleSave: async (id: string) => {
        try { await saveMutation.mutateAsync(id); return true } catch { return false }
    },
    ratePrompt: async (id: string, value: number) => {
        try { await rateMutation.mutateAsync({ promptId: id, value }); return true } catch { return false }
    },
    refreshUserPrompts: async () => {
        await queryClient.invalidateQueries({ queryKey: ['liked-prompts', userId] })
        await queryClient.invalidateQueries({ queryKey: ['saved-prompts', userId] })
    },
  }
}
