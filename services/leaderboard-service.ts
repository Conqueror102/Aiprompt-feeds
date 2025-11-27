/**
 * Leaderboard Service
 * 
 * Handles all leaderboard logic including scoring, ranking, and filtering.
 * Provides multiple leaderboard types with caching support.
 */

import {
  LeaderboardType,
  LeaderboardPeriod,
  LeaderboardEntry,
  LeaderboardFilters,
  LeaderboardResponse,
  LeaderboardMetadata,
  UserRankInfo,
  BadgeBreakdown,
  BadgeWithDetails,
  DEFAULT_SCORING_CONFIG,
  ScoringConfig,
  LeaderboardStats,
} from '@/types/leaderboard'
import { BadgeTier, BadgeCategory, UserBadge } from '@/types/badge'
import { getBadgeDefinition } from '@/lib/badges/badge-definitions'
import User from '@/lib/models/User'

type LeaderboardEntryBase = Omit<LeaderboardEntry, 'rank'>

export class LeaderboardService {
  private static scoringConfig: ScoringConfig = DEFAULT_SCORING_CONFIG
  private static cache: Map<string, { data: any; timestamp: number }> = new Map()
  private static CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get leaderboard with filters
   */
  static async getLeaderboard(
    filters: Partial<LeaderboardFilters> = {}
  ): Promise<LeaderboardResponse> {
    const defaultFilters: LeaderboardFilters = {
      type: LeaderboardType.OVERALL,
      period: LeaderboardPeriod.ALL_TIME,
      limit: 50,
      offset: 0,
      ...filters,
    }

    // Check cache
    const cacheKey = this.getCacheKey(defaultFilters)
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch data based on type
    let leaderboardEntries: LeaderboardEntry[]

    switch (defaultFilters.type) {
      case LeaderboardType.CATEGORY:
        if (!defaultFilters.category) {
          throw new Error('Category is required for category leaderboard')
        }
        leaderboardEntries = await this.getCategoryLeaderboard(
          defaultFilters.category,
          defaultFilters.period,
          defaultFilters.limit,
          defaultFilters.offset
        )
        break

      case LeaderboardType.TIER:
        if (!defaultFilters.tier) {
          throw new Error('Tier is required for tier leaderboard')
        }
        leaderboardEntries = await this.getTierLeaderboard(
          defaultFilters.tier,
          defaultFilters.period,
          defaultFilters.limit,
          defaultFilters.offset
        )
        break

      default:
        leaderboardEntries = await this.getOverallLeaderboard(
          defaultFilters.period,
          defaultFilters.limit,
          defaultFilters.offset,
          defaultFilters.searchQuery
        )
    }

    // Get total count for pagination
    const totalUsers = await this.getTotalUserCount(defaultFilters)

    const metadata: LeaderboardMetadata = {
      totalUsers,
      totalPages: Math.ceil(totalUsers / defaultFilters.limit),
      currentPage: Math.floor(defaultFilters.offset / defaultFilters.limit) + 1,
      period: defaultFilters.period,
      type: defaultFilters.type,
      lastUpdated: new Date(),
      category: defaultFilters.category,
      tier: defaultFilters.tier,
    }

    const response: LeaderboardResponse = {
      leaderboard: leaderboardEntries,
      metadata,
    }

    // Cache result
    this.setCache(cacheKey, response)

    return response
  }

  /**
   * Get overall leaderboard (all badges)
   */
  private static async getOverallLeaderboard(
    period: LeaderboardPeriod,
    limit: number,
    offset: number,
    searchQuery?: string
  ): Promise<LeaderboardEntry[]> {
    const dateFilter = this.getPeriodDateFilter(period)
    const matchStage: any = {}

    // Add search filter
    if (searchQuery) {
      matchStage.name = { $regex: searchQuery, $options: 'i' }
    }

    const pipeline = [
      { $match: matchStage },
      {
        $project: {
          name: 1,
          avatar: 1,
          badges: 1,
          createdAt: 1,
          // Filter badges by period
          filteredBadges: dateFilter
            ? {
                $filter: {
                  input: { $ifNull: ['$badges', []] },
                  as: 'badge',
                  cond: { $gte: ['$$badge.earnedAt', dateFilter] },
                },
              }
            : { $ifNull: ['$badges', []] },
        },
      },
      {
        $addFields: {
          badgeCount: { $size: '$filteredBadges' },
        },
      },
      {
        $match: {
          badgeCount: { $gt: 0 }, // Only users with badges
        },
      },
    ]

    const users = await User.aggregate(pipeline)

    // Calculate scores and format entries
    const entries = await Promise.all(
      users.map(async (user) => {
        const score = await this.calculateUserScore(user.filteredBadges)
        const breakdown = this.getBadgeBreakdown(user.filteredBadges)
        const topBadges = await this.getTopBadges(user.filteredBadges, 3)

        return {
          userId: user._id.toString(),
          userName: user.name,
          avatar: user.avatar,
          totalScore: score,
          badgeCount: user.badgeCount,
          badgeBreakdown: breakdown,
          topBadges,
          joinedAt: user.createdAt,
        } as LeaderboardEntryBase
      })
    )

    const sortedEntries = this.sortLeaderboardEntries(entries)
    return this.assignRanks(sortedEntries, offset, limit)
  }

  /**
   * Get category-specific leaderboard
   */
  private static async getCategoryLeaderboard(
    category: BadgeCategory,
    period: LeaderboardPeriod,
    limit: number,
    offset: number
  ): Promise<LeaderboardEntry[]> {
    const dateFilter = this.getPeriodDateFilter(period)

    const users = await User.find({ 'badges.0': { $exists: true } })
      .select('name avatar badges createdAt')
      .lean()

    // Filter and score users
    const scoredUsers = await Promise.all(
      users.map(async (user) => {
        let badges = user.badges || []

        // Filter by period
        if (dateFilter) {
          badges = badges.filter(
            (badge) => new Date(badge.earnedAt) >= dateFilter
          )
        }

        // Filter by category
        const categoryBadges = badges.filter((badge) => {
          const def = getBadgeDefinition(badge.badgeId)
          return def?.category === category
        })

        if (categoryBadges.length === 0) return null

        const score = await this.calculateUserScore(categoryBadges)
        const breakdown = this.getBadgeBreakdown(categoryBadges)
        const topBadges = await this.getTopBadges(categoryBadges, 3)

        return {
          userId: user._id.toString(),
          userName: user.name,
          avatar: user.avatar,
          totalScore: score,
          badgeCount: categoryBadges.length,
          badgeBreakdown: breakdown,
          topBadges,
          joinedAt: user.createdAt,
        }
      })
    )

    // Remove nulls and sort
    const validUsers = scoredUsers.filter(
      (user): user is NonNullable<typeof user> => user !== null
    )

    const sortedUsers = this.sortLeaderboardEntries(validUsers)
    return this.assignRanks(sortedUsers, offset, limit)
  }

  /**
   * Get tier-specific leaderboard
   */
  private static async getTierLeaderboard(
    tier: BadgeTier,
    period: LeaderboardPeriod,
    limit: number,
    offset: number
  ): Promise<LeaderboardEntry[]> {
    const dateFilter = this.getPeriodDateFilter(period)

    const users = await User.find({ 'badges.0': { $exists: true } })
      .select('name avatar badges createdAt')
      .lean()

    // Filter and score users
    const scoredUsers = await Promise.all(
      users.map(async (user) => {
        let badges = user.badges || []

        // Filter by period
        if (dateFilter) {
          badges = badges.filter(
            (badge) => new Date(badge.earnedAt) >= dateFilter
          )
        }

        // Filter by tier
        const tierBadges = badges.filter((badge) => {
          const def = getBadgeDefinition(badge.badgeId)
          if (!def) return false

          // For progressive badges, check the level's tier
          if (def.isProgressive && def.levels && badge.level) {
            const level = def.levels.find((l) => l.level === badge.level)
            return level?.tier === tier
          }

          return def.tier === tier
        })

        if (tierBadges.length === 0) return null

        const score = await this.calculateUserScore(tierBadges)
        const breakdown = this.getBadgeBreakdown(tierBadges)
        const topBadges = await this.getTopBadges(tierBadges, 3)

        return {
          userId: user._id.toString(),
          userName: user.name,
          avatar: user.avatar,
          totalScore: score,
          badgeCount: tierBadges.length,
          badgeBreakdown: breakdown,
          topBadges,
          joinedAt: user.createdAt,
        }
      })
    )

    // Remove nulls and sort
    const validUsers = scoredUsers
      .filter((user): user is NonNullable<typeof user> => user !== null)
      .sort((a, b) => b.totalScore - a.totalScore)

    // Paginate and assign ranks
    return validUsers.slice(offset, offset + limit).map((user, index) => ({
      ...user,
      rank: offset + index + 1,
    }))
  }

  /**
   * Get user's rank information
   */
  static async getUserRank(
    userId: string,
    type: LeaderboardType = LeaderboardType.OVERALL,
    period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME
  ): Promise<UserRankInfo | null> {
    const user = await User.findById(userId).select('badges').lean()
    if (!user) return null

    let badges = user.badges || []
    const dateFilter = this.getPeriodDateFilter(period)

    if (dateFilter) {
      badges = badges.filter((badge) => new Date(badge.earnedAt) >= dateFilter)
    }

    if (badges.length === 0) {
      return {
        userId,
        rank: 0,
        score: 0,
        percentile: 0,
        badgeCount: 0,
        totalUsers: await User.countDocuments(),
      }
    }

    const userScore = await this.calculateUserScore(badges)

    // Count users with higher scores
    const allUsers = await User.find({ 'badges.0': { $exists: true } })
      .select('badges')
      .lean()

    const scores = await Promise.all(
      allUsers.map(async (u) => {
        let userBadges = u.badges || []
        if (dateFilter) {
          userBadges = userBadges.filter(
            (b) => new Date(b.earnedAt) >= dateFilter
          )
        }
        return this.calculateUserScore(userBadges)
      })
    )

    scores.sort((a, b) => b - a)
    const rank = scores.findIndex((s) => s <= userScore) + 1
    const percentile = ((scores.length - rank + 1) / scores.length) * 100

    // Get nearby users
    const leaderboard = await this.getOverallLeaderboard(period, 5, Math.max(0, rank - 3))

    return {
      userId,
      rank,
      score: userScore,
      percentile: Math.round(percentile * 10) / 10,
      badgeCount: badges.length,
      totalUsers: scores.length,
      nearby: leaderboard,
    }
  }

  /**
   * Calculate total score for user's badges
   */
  static async calculateUserScore(badges: UserBadge[]): Promise<number> {
    let totalScore = 0

    for (const badge of badges) {
      const definition = getBadgeDefinition(badge.badgeId)
      if (!definition) continue

      // Base score from tier
      let baseScore = this.scoringConfig.tierWeights[definition.tier] || 0

      // Apply level multiplier for progressive badges
      if (definition.isProgressive && badge.level) {
        const multiplier =
          this.scoringConfig.levelMultipliers[badge.level] || 1.0
        baseScore *= multiplier
      }

      // Apply category bonus
      const categoryBonus =
        this.scoringConfig.categoryBonuses[definition.category] || 1.0
      baseScore *= categoryBonus

      totalScore += Math.round(baseScore)
    }

    return totalScore
  }

  /**
   * Get badge breakdown by tier
   */
  private static getBadgeBreakdown(badges: UserBadge[]): BadgeBreakdown {
    const breakdown: BadgeBreakdown = {
      legendary: 0,
      epic: 0,
      rare: 0,
      uncommon: 0,
      common: 0,
    }

    badges.forEach((badge) => {
      const definition = getBadgeDefinition(badge.badgeId)
      if (!definition) return

      // For progressive badges, check the level's tier
      let tier = definition.tier
      if (definition.isProgressive && definition.levels && badge.level) {
        const level = definition.levels.find((l) => l.level === badge.level)
        if (level) tier = level.tier
      }

      switch (tier) {
        case BadgeTier.LEGENDARY:
          breakdown.legendary++
          break
        case BadgeTier.EPIC:
          breakdown.epic++
          break
        case BadgeTier.RARE:
          breakdown.rare++
          break
        case BadgeTier.UNCOMMON:
          breakdown.uncommon++
          break
        case BadgeTier.COMMON:
          breakdown.common++
          break
      }
    })

    return breakdown
  }

  /**
   * Get top N badges by score
   */
  private static async getTopBadges(
    badges: UserBadge[],
    limit: number
  ): Promise<BadgeWithDetails[]> {
    const badgesWithScores = await Promise.all(
      badges.map(async (badge) => {
        const definition = getBadgeDefinition(badge.badgeId)
        if (!definition) return null

        const score = await this.calculateUserScore([badge])

        return {
          badgeId: badge.badgeId,
          definition,
          earnedAt: badge.earnedAt,
          level: badge.level,
          score,
        } as BadgeWithDetails
      })
    )

    return badgesWithScores
      .filter((b): b is BadgeWithDetails => b !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  private static sortLeaderboardEntries(
    entries: LeaderboardEntryBase[]
  ): LeaderboardEntryBase[] {
    return entries.sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore
      }

      if (b.badgeCount !== a.badgeCount) {
        return b.badgeCount - a.badgeCount
      }

      const aJoined = a.joinedAt ? new Date(a.joinedAt).getTime() : 0
      const bJoined = b.joinedAt ? new Date(b.joinedAt).getTime() : 0
      return aJoined - bJoined
    })
  }

  private static assignRanks(
    entries: LeaderboardEntryBase[],
    offset: number,
    limit: number
  ): LeaderboardEntry[] {
    return entries.slice(offset, offset + limit).map((entry, index) => ({
      ...entry,
      rank: offset + index + 1,
    }))
  }

  /**
   * Get date filter for period
   */
  private static getPeriodDateFilter(period: LeaderboardPeriod): Date | null {
    const now = new Date()

    switch (period) {
      case LeaderboardPeriod.WEEKLY:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case LeaderboardPeriod.MONTHLY:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case LeaderboardPeriod.YEARLY:
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      case LeaderboardPeriod.ALL_TIME:
      default:
        return null
    }
  }

  /**
   * Get total user count for filters
   */
  private static async getTotalUserCount(
    filters: LeaderboardFilters
  ): Promise<number> {
    // Simplified - would need more complex logic for category/tier filters
    return User.countDocuments({ 'badges.0': { $exists: true } })
  }

  /**
   * Get leaderboard statistics
   */
  static async getLeaderboardStats(): Promise<LeaderboardStats> {
    const users = await User.find({ 'badges.0': { $exists: true } })
      .select('badges')
      .lean()

    const totalUsers = users.length
    let totalBadges = 0
    const badgeFrequency = new Map<string, number>()

    users.forEach((user) => {
      const badges = user.badges || []
      totalBadges += badges.length

      badges.forEach((badge) => {
        badgeFrequency.set(
          badge.badgeId,
          (badgeFrequency.get(badge.badgeId) || 0) + 1
        )
      })
    })

    const scores = await Promise.all(
      users.map((u) => this.calculateUserScore(u.badges || []))
    )

    const sortedFrequency = Array.from(badgeFrequency.entries()).sort(
      (a, b) => a[1] - b[1]
    )

    return {
      totalUsers,
      totalBadgesAwarded: totalBadges,
      averageBadgesPerUser: totalUsers > 0 ? totalBadges / totalUsers : 0,
      topScore: Math.max(...scores, 0),
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      mostCommonBadge: sortedFrequency[sortedFrequency.length - 1]?.[0] || '',
      rarestBadge: sortedFrequency[0]?.[0] || '',
    }
  }

  /**
   * Cache management
   */
  private static getCacheKey(filters: LeaderboardFilters): string {
    return JSON.stringify(filters)
  }

  private static getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private static setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })

    // Simple cache cleanup
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
  }

  /**
   * Clear cache (call when badges are awarded)
   */
  static clearCache(): void {
    this.cache.clear()
  }
}
