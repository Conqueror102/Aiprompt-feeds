/**
 * Badge Management Hook
 * 
 * Custom hook for managing badge-related operations
 */

"use client"

import { useState, useEffect, useCallback } from 'react'
import { BadgeDisplay, BadgeNotification } from '@/types/badge'
import { ALL_BADGES } from '@/lib/badges/badge-definitions'
import { useBadgeNotifications } from '@/components/badges/BadgeNotification'

interface UseBadgesOptions {
  userId?: string
  autoCheck?: boolean
  checkInterval?: number
}

interface UseBadgesReturn {
  badges: BadgeDisplay[]
  loading: boolean
  error: string | null
  checkBadges: () => Promise<void>
  refreshBadges: () => Promise<void>
  earnedCount: number
  totalCount: number
  progress: number
}

export function useBadges({
  userId,
  autoCheck = false,
  checkInterval = 30000 // 30 seconds
}: UseBadgesOptions = {}): UseBadgesReturn {
  const [badges, setBadges] = useState<BadgeDisplay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showMultipleBadgeNotifications } = useBadgeNotifications()

  // Initialize badges with all definitions
  useEffect(() => {
    const initialBadges: BadgeDisplay[] = ALL_BADGES.map(badge => ({
      ...badge,
      earned: false,
      progress: 0
    }))
    setBadges(initialBadges)
  }, [])

  // Fetch user's earned badges
  const fetchUserBadges = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/badges/user/${userId}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch badges')
      }

      // Merge earned badges with all badge definitions
      const updatedBadges: BadgeDisplay[] = ALL_BADGES.map(badge => {
        const earnedBadge = data.data.badges.find((eb: any) => eb.badgeId === badge.id)

        return {
          ...badge,
          earned: !!earnedBadge,
          earnedAt: earnedBadge?.earnedAt,
          level: earnedBadge?.level,
          progress: earnedBadge?.progress || 0
        }
      })

      setBadges(updatedBadges)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching user badges:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

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

      if (!data.success) {
        throw new Error(data.error || 'Failed to check badges')
      }

      const newBadges: BadgeNotification[] = data.data.newBadges

      if (newBadges.length > 0) {
        // Show notifications for new badges
        showMultipleBadgeNotifications(newBadges)

        // Refresh badge list
        await fetchUserBadges()
      }
    } catch (err) {
      console.error('Error checking badges:', err)
    }
  }, [userId, fetchUserBadges, showMultipleBadgeNotifications])

  // Auto-check badges at intervals
  useEffect(() => {
    if (!autoCheck || !userId) return

    const interval = setInterval(checkBadges, checkInterval)
    return () => clearInterval(interval)
  }, [autoCheck, userId, checkBadges, checkInterval])

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchUserBadges()
    }
  }, [userId, fetchUserBadges])

  // Calculate stats
  const earnedCount = badges.filter(b => b.earned).length
  const totalCount = badges.length
  const progress = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0

  return {
    badges,
    loading,
    error,
    checkBadges,
    refreshBadges: fetchUserBadges,
    earnedCount,
    totalCount,
    progress
  }
}

/**
 * Hook for badge leaderboard
 */
export function useBadgeLeaderboard(limit: number = 10) {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/badges/leaderboard?limit=${limit}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch leaderboard')
      }

      setLeaderboard(data.data.leaderboard)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching badge leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    leaderboard,
    loading,
    error,
    refresh: fetchLeaderboard
  }
}

/**
 * Hook for triggering badge checks after user actions
 */
export function useBadgeChecker() {
  const checkAfterAction = useCallback(async (action: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Small delay to ensure database is updated
      setTimeout(async () => {
        const response = await fetch('/api/badges/check', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        if (data.success && data.data.newBadges.length > 0) {
          // Badges will be shown via the main useBadges hook
          console.log(`Badge check after ${action}:`, data.data.newBadges)
        }
      }, 200)
    } catch (err) {
      console.error('Error checking badges after action:', err)
    }
  }, [])

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
