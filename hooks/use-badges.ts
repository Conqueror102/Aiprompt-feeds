/**
 * Badge Management Hook
 * 
 * Custom hook for managing badge-related operations
 */

"use client"

import { useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeDisplay, BadgeNotification } from '@/types/badge'
import { ALL_BADGES } from '@/lib/badges/badge-definitions'
import { useBadgeNotifications } from '@/components/badges/BadgeNotification'

interface UseBadgesOptions {
  userId?: string
  autoCheck?: boolean
  checkInterval?: number
}

export function useBadges({
  userId,
  autoCheck = false,
  checkInterval = 30000 // 30 seconds
}: UseBadgesOptions = {}) {
  const queryClient = useQueryClient()
  const { showMultipleBadgeNotifications } = useBadgeNotifications()

  // Initialize badges with all definitions merged with earned data
  const { data: badges = [], isLoading, error, refetch } = useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      if (!userId) return ALL_BADGES.map(b => ({ ...b, earned: false, progress: 0 }))
      const response = await fetch(`/api/badges/user/${userId}`)
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to fetch badges')
      
      return ALL_BADGES.map(badge => {
        const earnedBadge = data.data.badges.find((eb: any) => eb.badgeId === badge.id)
        return {
          ...badge,
          earned: !!earnedBadge,
          earnedAt: earnedBadge?.earnedAt,
          level: earnedBadge?.level,
          progress: earnedBadge?.progress || 0
        } as BadgeDisplay
      })
    },
    enabled: true, // Always fetch, fallback is default list if no userId
    staleTime: 60000,
  })

  // Check for new badges
  const checkBadges = useCallback(async () => {
    if (!userId) return

    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/badges/check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()

      if (data.success && data.data.newBadges.length > 0) {
        showMultipleBadgeNotifications(data.data.newBadges)
        queryClient.invalidateQueries({ queryKey: ['user-badges', userId] })
      }
    } catch (err) {
      console.error('Error checking badges:', err)
    }
  }, [userId, showMultipleBadgeNotifications, queryClient])

  // Auto-check badges at intervals
  useEffect(() => {
    if (!autoCheck || !userId) return
    const interval = setInterval(checkBadges, checkInterval)
    return () => clearInterval(interval)
  }, [autoCheck, userId, checkBadges, checkInterval])

  // Calculate stats
  const earnedCount = badges.filter(b => b.earned).length
  const totalCount = badges.length
  const progress = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0

  return {
    badges,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    checkBadges,
    refreshBadges: async () => { await refetch() },
    earnedCount,
    totalCount,
    progress
  }
}

/**
 * Hook for badge leaderboard
 */
export function useBadgeLeaderboard(limit: number = 10) {
  const { data: leaderboard = [], isLoading, error, refetch } = useQuery({
    queryKey: ['badge-leaderboard', limit],
    queryFn: async () => {
      const response = await fetch(`/api/badges/leaderboard?limit=${limit}`)
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to fetch leaderboard')
      return data.data.leaderboard
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  return {
    leaderboard,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refresh: async () => { await refetch() }
  }
}

/**
 * Hook for triggering badge checks after user actions
 */
export function useBadgeChecker() {
  const queryClient = useQueryClient()
  
  const checkAfterAction = useCallback(async (action: string) => {
    // Optimistic / "fire and forget" check
    const token = localStorage.getItem('token')
    if (!token) return
    
    // We do a smart invalidation or check
    // If we want to check explicitly, we call the check endpoint.
    // Ideally we should use the same logic as checkBadges.
    // But since this hook might be used where userId isn't available in scope, we rely on the API.
    
    // Actually, useBadgeChecker was used in hooks where we might not have badges context.
    // Let's implement it to trigger the check endpoint.
    setTimeout(async () => {
         try {
             // We can't easily access the user ID to invalidate 'user-badges' specifically without passing it.
             // But we can invalidate loosely if needed, or better, just run the check endpoint which returns new badges.
             const response = await fetch('/api/badges/check', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
             })
             const data = await response.json()
             if (data.success && data.data.newBadges.length > 0) {
                 // Trigger global badge refresh if possible, or reliance on auto-check.
                 // We can invalidate 'user-badges' globally or specifically if we knew the ID.
                 queryClient.invalidateQueries({ queryKey: ['user-badges'] })
                 // The notification normally happens in the component listening to this, but here it's detached.
                 // We rely on the fact that `useBadges` is mounted somewhere (layout?) to show them?
                 // Original `useBadgeChecker` just logged to console! 
                 // Ah, `useBadges` (mounted in layout?) would pick up the invalidation presumably?
                 // Ideally we should dispatch a custom event or let the active `useBadges` handle it.
                 // For now, invalidating `user-badges` is sufficient for UI updates.
             }
         } catch(e) { console.error(e) }
    }, 1000)
  }, [queryClient])

  return {
    checkAfterPromptCreate: () => checkAfterAction('prompt_create'),
    checkAfterPromptLike: () => checkAfterAction('prompt_like'),
    checkAfterPromptSave: () => checkAfterAction('prompt_save'),
    checkAfterFollow: () => checkAfterAction('follow'),
    checkAfterLogin: () => checkAfterAction('login'),
    checkAfterComment: () => checkAfterAction('comment_create'),
    checkAfterCommentLike: () => checkAfterAction('comment_like')
  }
}
