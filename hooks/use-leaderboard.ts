/**
 * Leaderboard Hook
 * 
 * Custom hook for managing leaderboard state, fetching data, and handling filters.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  LeaderboardType,
  LeaderboardPeriod,
  LeaderboardEntry,
  LeaderboardResponse,
  LeaderboardFilters,
  UserRankInfo,
  LeaderboardStats,
} from '@/types/leaderboard'
import { BadgeCategory, BadgeTier } from '@/types/badge'

interface UseLeaderboardOptions {
  type?: LeaderboardType
  period?: LeaderboardPeriod
  category?: BadgeCategory
  tier?: BadgeTier
  limit?: number
  autoFetch?: boolean
}

interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[]
  loading: boolean
  error: string | null
  metadata: LeaderboardResponse['metadata'] | null
  currentUserRank: UserRankInfo | null
  
  // Filters
  filters: Partial<LeaderboardFilters>
  setType: (type: LeaderboardType) => void
  setPeriod: (period: LeaderboardPeriod) => void
  setCategory: (category: BadgeCategory | undefined) => void
  setTier: (tier: BadgeTier | undefined) => void
  setSearchQuery: (query: string) => void
  
  // Actions
  fetchLeaderboard: () => Promise<void>
  fetchUserRank: (userId: string) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  
  // Pagination
  hasMore: boolean
  currentPage: number
}

export function useLeaderboard(
  options: UseLeaderboardOptions = {}
): UseLeaderboardReturn {
  const {
    type = LeaderboardType.OVERALL,
    period = LeaderboardPeriod.ALL_TIME,
    category,
    tier,
    limit = 50,
    autoFetch = true,
  } = options

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<LeaderboardResponse['metadata'] | null>(null)
  const [currentUserRank, setCurrentUserRank] = useState<UserRankInfo | null>(null)
  
  const [filters, setFilters] = useState<Partial<LeaderboardFilters>>({
    type,
    period,
    category,
    tier,
    limit,
    offset: 0,
  })

  /**
   * Fetch leaderboard data
   */
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (filters.type) params.append('type', filters.type)
      if (filters.period) params.append('period', filters.period)
      if (filters.category) params.append('category', filters.category)
      if (filters.tier) params.append('tier', filters.tier)
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.offset) params.append('offset', filters.offset.toString())
      if (filters.searchQuery) params.append('search', filters.searchQuery)

      const response = await fetch(`/api/badges/leaderboard?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch leaderboard')
      }

      const data: LeaderboardResponse = result.data

      // If offset is 0, replace data; otherwise append (for infinite scroll)
      if (filters.offset === 0) {
        setLeaderboard(data.leaderboard)
      } else {
        setLeaderboard((prev) => [...prev, ...data.leaderboard])
      }

      setMetadata(data.metadata)
      
      if (data.currentUser) {
        setCurrentUserRank(data.currentUser)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  /**
   * Fetch user's rank information
   */
  const fetchUserRank = useCallback(async (userId: string) => {
    try {
      const params = new URLSearchParams()
      
      if (filters.type) params.append('type', filters.type)
      if (filters.period) params.append('period', filters.period)

      const response = await fetch(
        `/api/badges/leaderboard/user/${userId}?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch user rank')
      }

      const result = await response.json()

      if (result.success) {
        setCurrentUserRank(result.data)
      }
    } catch (err) {
      console.error('Error fetching user rank:', err)
    }
  }, [filters.type, filters.period])

  /**
   * Load more entries (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!metadata || loading) return

    const nextOffset = (filters.offset || 0) + (filters.limit || 50)
    
    setFilters((prev) => ({
      ...prev,
      offset: nextOffset,
    }))
  }, [filters.offset, filters.limit, metadata, loading])

  /**
   * Refresh leaderboard (reset to page 1)
   */
  const refresh = useCallback(async () => {
    setFilters((prev) => ({
      ...prev,
      offset: 0,
    }))
  }, [])

  /**
   * Filter setters
   */
  const setType = useCallback((newType: LeaderboardType) => {
    setFilters((prev) => ({
      ...prev,
      type: newType,
      offset: 0,
    }))
  }, [])

  const setPeriod = useCallback((newPeriod: LeaderboardPeriod) => {
    setFilters((prev) => ({
      ...prev,
      period: newPeriod,
      offset: 0,
    }))
  }, [])

  const setCategory = useCallback((newCategory: BadgeCategory | undefined) => {
    setFilters((prev) => ({
      ...prev,
      category: newCategory,
      offset: 0,
    }))
  }, [])

  const setTier = useCallback((newTier: BadgeTier | undefined) => {
    setFilters((prev) => ({
      ...prev,
      tier: newTier,
      offset: 0,
    }))
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: query || undefined,
      offset: 0,
    }))
  }, [])

  /**
   * Auto-fetch on mount and when filters change
   */
  useEffect(() => {
    if (autoFetch) {
      fetchLeaderboard()
    }
  }, [autoFetch, fetchLeaderboard])

  /**
   * Calculate pagination state
   */
  const hasMore = metadata
    ? (filters.offset || 0) + leaderboard.length < metadata.totalUsers
    : false

  const currentPage = metadata ? metadata.currentPage : 1

  return {
    leaderboard,
    loading,
    error,
    metadata,
    currentUserRank,
    
    filters,
    setType,
    setPeriod,
    setCategory,
    setTier,
    setSearchQuery,
    
    fetchLeaderboard,
    fetchUserRank,
    loadMore,
    refresh,
    
    hasMore,
    currentPage,
  }
}

/**
 * Hook for fetching leaderboard stats
 */
export function useLeaderboardStats() {
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/badges/leaderboard/stats')

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const result = await response.json()

      if (result.success) {
        setStats(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch stats')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}
