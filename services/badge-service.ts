/**
 * Badge Service
 * 
 * Core service for badge management, calculation, and awarding.
 * Handles all badge-related business logic.
 */

import {
  BadgeDefinition,
  UserBadge,
  UserStats,
  BadgeCheckResult,
  BadgeCriteriaType,
  BadgeNotification
} from '@/types/badge'

// Interface for User document with proper typing
interface UserDocument {
  _id: string
  followers?: string[]
  following?: string[]
  stats?: Partial<UserStats>
  createdAt?: Date
  updatedAt?: Date
  badges?: UserBadge[]
}
import {
  ALL_BADGES,
  getBadgeDefinition,
  BADGE_DEFINITIONS_MAP
} from '@/lib/badges/badge-definitions'
import {
  executeValidator,
  calculateAccountAge
} from '@/lib/badges/badge-validators'
import User from '@/lib/models/User'
import Prompt from '@/lib/models/Prompt'
import Comment from '@/lib/models/Comment'

export class BadgeService {
  /**
   * Check all badges for a user and return newly earned badges
   */
  static async checkUserBadges(userId: string): Promise<BadgeNotification[]> {
    try {
      const user = await User.findById(userId).lean() as UserDocument
      if (!user) {
        throw new Error('User not found')
      }

      const userStats = await this.calculateUserStats(userId)
      const currentBadges = new Map(
        user.badges?.map(badge => [badge.badgeId, badge]) || []
      )

      const newBadges: BadgeNotification[] = []

      for (const badgeDefinition of ALL_BADGES) {
        const result = this.checkBadgeEligibility(badgeDefinition, userStats, currentBadges)

        if (result.earned && !currentBadges.has(result.badgeId)) {
          // Award new badge
          await this.awardBadge(userId, result.badgeId, result.level)

          newBadges.push({
            badge: badgeDefinition,
            level: result.level,
            earnedAt: new Date(),
            isNew: true
          })
        } else if (result.earned && result.level && result.level > (currentBadges.get(result.badgeId)?.level || 0)) {
          // Upgrade existing progressive badge
          await this.upgradeBadge(userId, result.badgeId, result.level)

          newBadges.push({
            badge: badgeDefinition,
            level: result.level,
            earnedAt: new Date(),
            isNew: false
          })
        }
      }

      return newBadges
    } catch (error) {
      console.error('Error checking user badges:', error)
      return []
    }
  }

  /**
   * Calculate comprehensive user statistics for badge evaluation
   */
  static async calculateUserStats(userId: string): Promise<UserStats> {
    try {
      const user = await User.findById(userId).lean() as UserDocument
      const [prompts, userComments, userRepliesAgg, commentsWithRepliesAgg, uniqueUsersHelpedAgg, totalCommentLikesAgg] = await Promise.all([
        Prompt.find({ createdBy: userId }).lean(),
        Comment.find({ authorId: userId, isDeleted: false }).select('_id likes parentId').lean(),
        Comment.countDocuments({ authorId: userId, isDeleted: false, parentId: { $ne: null } }),
        Comment.aggregate([
          { $match: { authorId: (userId as any), isDeleted: false, parentId: null } },
          { $lookup: { from: 'comments', localField: '_id', foreignField: 'parentId', as: 'replies' } },
          { $project: { hasReplies: { $gt: [{ $size: '$replies' }, 0] } } },
          { $match: { hasReplies: true } },
          { $count: 'count' }
        ]),
        Comment.aggregate([
          { $match: { authorId: (userId as any), isDeleted: false, parentId: { $ne: null } } },
          { $lookup: { from: 'comments', localField: 'parentId', foreignField: '_id', as: 'parent' } },
          { $unwind: '$parent' },
          { $group: { _id: '$parent.authorId' } },
          { $count: 'count' }
        ]),
        Comment.aggregate([
          { $match: { authorId: (userId as any), isDeleted: false } },
          { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
        ])
      ])

      if (!user) {
        throw new Error('User not found')
      }

      // Calculate basic stats
      const totalPrompts = prompts.length
      const totalLikes = prompts.reduce((sum, prompt) => sum + (prompt.likes || 0), 0)
      const totalSaves = prompts.reduce((sum, prompt) => sum + (prompt.saves || 0), 0)

      // Calculate categories and agents used
      const categoriesUsed = [...new Set(prompts.map(p => p.category))]
      const agentsUsed = [...new Set(prompts.flatMap(p => p.aiAgents || []))]

      // Calculate rating stats
      const ratedPrompts = prompts.filter(p => p.rating !== null && p.rating !== undefined)
      const averageRating = ratedPrompts.length > 0
        ? ratedPrompts.reduce((sum, p) => sum + p.rating, 0) / ratedPrompts.length
        : 0
      const highestRatedPrompt = Math.max(...ratedPrompts.map(p => p.rating), 0)

      // Calculate viral prompts (100+ likes)
      const viralPrompts = prompts.filter(p => (p.likes || 0) >= 100).length

      // Calculate weekend prompts
      const weekendPrompts = prompts.filter(p => {
        const createdDate = new Date(p.createdAt)
        const day = createdDate.getDay()
        return day === 0 || day === 6 // Sunday or Saturday
      }).length

      // Calculate consecutive days (simplified - would need more complex logic for real implementation)
      const consecutiveDays = user.stats?.consecutiveDays || 0

      return {
        totalPrompts,
        totalLikes,
        totalSaves,
        totalFollowers: user.followers?.length || 0,
        totalFollowing: user.following?.length || 0,
        consecutiveDays,
        lastActiveDate: user.stats?.lastActiveDate || user.updatedAt || new Date(),
        categoriesUsed,
        agentsUsed,
        accountCreatedAt: user.createdAt || new Date(),
        highestRatedPrompt,
        averageRating,
        promptsWithRating: ratedPrompts.length,
        viralPrompts,
        weekendPrompts,
        // Comment-related stats for badges
        totalComments: userComments.length,
        totalCommentLikes: (totalCommentLikesAgg[0]?.totalLikes || 0) as number,
        totalReplies: userRepliesAgg || 0,
        commentsWithReplies: (commentsWithRepliesAgg[0]?.count || 0) as number,
        uniqueUsersHelped: (uniqueUsersHelpedAgg[0]?.count || 0) as number
      }
    } catch (error) {
      console.error('Error calculating user stats:', error)
      throw error
    }
  }

  /**
   * Check if user is eligible for a specific badge
   */
  static checkBadgeEligibility(
    badge: BadgeDefinition,
    userStats: UserStats,
    currentBadges: Map<string, UserBadge>
  ): BadgeCheckResult {
    const result: BadgeCheckResult = {
      badgeId: badge.id,
      earned: false
    }

    try {
      switch (badge.criteria.type) {
        case BadgeCriteriaType.THRESHOLD:
          return this.checkThresholdBadge(badge, userStats, currentBadges)

        case BadgeCriteriaType.CUSTOM:
          return this.checkCustomBadge(badge, userStats)

        case BadgeCriteriaType.TIME_BASED:
          return this.checkTimeBadge(badge, userStats, currentBadges)

        default:
          console.warn(`Unsupported badge criteria type: ${badge.criteria.type}`)
          return result
      }
    } catch (error) {
      console.error(`Error checking badge eligibility for ${badge.id}:`, error)
      return result
    }
  }

  /**
   * Check threshold-based badges (simple numeric thresholds)
   */
  private static checkThresholdBadge(
    badge: BadgeDefinition,
    userStats: UserStats,
    currentBadges: Map<string, UserBadge>
  ): BadgeCheckResult {
    const field = badge.criteria.field as keyof UserStats
    const currentValue = userStats[field] as number

    if (badge.isProgressive && badge.levels) {
      // Progressive badge - find highest earned level
      const currentBadge = currentBadges.get(badge.id)
      const currentLevel = currentBadge?.level || 0

      for (let i = badge.levels.length - 1; i >= 0; i--) {
        const level = badge.levels[i]
        if (currentValue >= level.threshold && level.level > currentLevel) {
          return {
            badgeId: badge.id,
            earned: true,
            level: level.level,
            previousLevel: currentLevel
          }
        }
      }

      // Calculate progress to next level
      const nextLevel = badge.levels.find(l => l.level > currentLevel)
      if (nextLevel) {
        const progress = Math.min((currentValue / nextLevel.threshold) * 100, 100)
        return {
          badgeId: badge.id,
          earned: false,
          progress,
          level: currentLevel
        }
      }
    } else {
      // Simple threshold badge
      const threshold = badge.criteria.threshold || 0
      return {
        badgeId: badge.id,
        earned: currentValue >= threshold
      }
    }

    return { badgeId: badge.id, earned: false }
  }

  /**
   * Check custom validation badges
   */
  private static checkCustomBadge(
    badge: BadgeDefinition,
    userStats: UserStats
  ): BadgeCheckResult {
    if (!badge.criteria.customValidator) {
      return { badgeId: badge.id, earned: false }
    }

    const earned = executeValidator(
      badge.criteria.customValidator,
      userStats,
      badge.criteria.params || {}
    )

    return {
      badgeId: badge.id,
      earned
    }
  }

  /**
   * Check time-based badges
   */
  private static checkTimeBadge(
    badge: BadgeDefinition,
    userStats: UserStats,
    currentBadges: Map<string, UserBadge>
  ): BadgeCheckResult {
    const accountAge = calculateAccountAge(userStats.accountCreatedAt)

    if (badge.isProgressive && badge.levels) {
      const currentBadge = currentBadges.get(badge.id)
      const currentLevel = currentBadge?.level || 0

      for (let i = badge.levels.length - 1; i >= 0; i--) {
        const level = badge.levels[i]
        if (accountAge >= level.threshold && level.level > currentLevel) {
          return {
            badgeId: badge.id,
            earned: true,
            level: level.level,
            previousLevel: currentLevel
          }
        }
      }
    }

    return { badgeId: badge.id, earned: false }
  }

  /**
   * Award a new badge to user
   */
  static async awardBadge(userId: string, badgeId: string, level: number = 1): Promise<void> {
    try {
      await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            badges: {
              badgeId,
              earnedAt: new Date(),
              level,
              progress: 0
            }
          }
        }
      )
    } catch (error) {
      console.error(`Error awarding badge ${badgeId} to user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Upgrade existing progressive badge
   */
  static async upgradeBadge(userId: string, badgeId: string, newLevel: number): Promise<void> {
    try {
      await User.findOneAndUpdate(
        { _id: userId, 'badges.badgeId': badgeId },
        {
          $set: {
            'badges.$.level': newLevel,
            'badges.$.earnedAt': new Date(),
            'badges.$.progress': 0
          }
        }
      )
    } catch (error) {
      console.error(`Error upgrading badge ${badgeId} for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Update user statistics (call this when user performs actions)
   */
  static async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<void> {
    try {
      const updateFields: any = {}

      Object.entries(updates).forEach(([key, value]) => {
        updateFields[`stats.${key}`] = value
      })

      await User.findByIdAndUpdate(userId, { $set: updateFields })
    } catch (error) {
      console.error(`Error updating user stats for ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get user's badges with definitions
   */
  static async getUserBadges(userId: string) {
    try {
      const user = await User.findById(userId).lean() as UserDocument
      if (!user || !user.badges) {
        return []
      }

      return user.badges.map(userBadge => ({
        ...userBadge,
        definition: getBadgeDefinition(userBadge.badgeId)
      })).filter(badge => badge.definition) // Filter out badges with missing definitions
    } catch (error) {
      console.error(`Error getting badges for user ${userId}:`, error)
      return []
    }
  }

  /**
   * Get badge leaderboard
   */
  static async getBadgeLeaderboard(limit: number = 10) {
    try {
      const users = await User.aggregate([
        {
          $project: {
            name: 1,
            avatar: 1,
            badgeCount: { $size: { $ifNull: ['$badges', []] } },
            badges: 1
          }
        },
        { $sort: { badgeCount: -1 } },
        { $limit: limit }
      ])

      return users
    } catch (error) {
      console.error('Error getting badge leaderboard:', error)
      return []
    }
  }
}
