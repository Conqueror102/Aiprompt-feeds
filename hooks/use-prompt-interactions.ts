// Custom hook for managing prompt likes and saves
import { useState, useEffect } from 'react'
import { promptService } from '@/services/prompt-service'
import { toast } from '@/hooks/use-toast'
import { useBadgeChecker } from '@/hooks/use-badges'

export function usePromptInteractions(userId?: string) {
  const [likedPromptIds, setLikedPromptIds] = useState<Set<string>>(new Set())
  const [savedPromptIds, setSavedPromptIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const { checkAfterPromptLike, checkAfterPromptSave } = useBadgeChecker()

  const fetchUserPrompts = async () => {
    if (!userId) {
      setLikedPromptIds(new Set())
      setSavedPromptIds(new Set())
      return
    }

    setLoading(true)
    try {
      const [likedPrompts, savedPrompts] = await Promise.all([
        promptService.getLikedPrompts(),
        promptService.getSavedPrompts(),
      ])

      const likedIds = new Set(likedPrompts.map((p) => p._id))
      const savedIds = new Set(savedPrompts.map((p) => p._id))

      console.log('Fetched liked prompts:', likedIds)
      console.log('Fetched saved prompts:', savedIds)

      setLikedPromptIds(likedIds)
      setSavedPromptIds(savedIds)
    } catch (error) {
      console.error('Failed to fetch user prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = async (promptId: string) => {
    if (!userId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like prompts',
        variant: 'destructive',
      })
      return false
    }

    // Optimistic update
    const wasLiked = likedPromptIds.has(promptId)
    setLikedPromptIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(promptId)) {
        newSet.delete(promptId)
      } else {
        newSet.add(promptId)
      }
      console.log('Optimistic like update:', promptId, 'wasLiked:', wasLiked, 'newState:', !wasLiked)
      return newSet
    })

    try {
      await promptService.like(promptId)
      console.log('Like API call successful for:', promptId)
      checkAfterPromptLike()
      return true
    } catch (error) {
      console.error('Like API call failed:', error)
      // Revert optimistic update on error
      setLikedPromptIds((prev) => {
        const newSet = new Set(prev)
        if (wasLiked) {
          newSet.add(promptId)
        } else {
          newSet.delete(promptId)
        }
        return newSet
      })
      toast({
        title: 'Error',
        description: 'Failed to like prompt',
        variant: 'destructive',
      })
      return false
    }
  }

  const toggleSave = async (promptId: string) => {
    if (!userId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save prompts',
        variant: 'destructive',
      })
      return false
    }

    try {
      await promptService.save(promptId)
      const wasSaved = savedPromptIds.has(promptId)
      checkAfterPromptSave()

      setSavedPromptIds((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(promptId)) {
          newSet.delete(promptId)
        } else {
          newSet.add(promptId)
        }
        return newSet
      })

      toast({
        title: wasSaved ? 'Removed from saved' : 'Saved!',
        description: wasSaved
          ? 'Prompt removed from your saved list'
          : 'Prompt saved to your collection',
      })
      return true
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save prompt',
        variant: 'destructive',
      })
      return false
    }
  }

  useEffect(() => {
    fetchUserPrompts()
  }, [userId])

  return {
    likedPromptIds,
    savedPromptIds,
    loading,
    toggleLike,
    toggleSave,
    refreshUserPrompts: fetchUserPrompts,
  }
}
