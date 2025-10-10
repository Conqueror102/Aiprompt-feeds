/**
 * Badge System Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the badge system.
 * Badges are achievements users can earn based on their activity and contributions.
 */

/**
 * Badge rarity tiers - determines visual styling and prestige
 */
export enum BadgeTier {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

/**
 * Badge categories - groups badges by type of achievement
 */
export enum BadgeCategory {
  CONTENT_CREATION = 'content_creation',
  ENGAGEMENT = 'engagement',
  SOCIAL = 'social',
  TIME_BASED = 'time_based',
  SPECIALTY = 'specialty',
  MILESTONE = 'milestone'
}

/**
 * Badge definition - describes a badge type that can be earned
 */
export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string // Emoji or icon identifier
  tier: BadgeTier
  category: BadgeCategory
  /** Criteria that must be met to earn this badge */
  criteria: BadgeCriteria
  /** Whether this badge has multiple levels (e.g., Bronze, Silver, Gold) */
  isProgressive?: boolean
  /** For progressive badges, the level thresholds */
  levels?: BadgeLevel[]
}

/**
 * Badge level for progressive badges
 */
export interface BadgeLevel {
  level: number
  name: string
  threshold: number
  tier: BadgeTier
}

/**
 * Criteria for earning a badge
 */
export interface BadgeCriteria {
  type: BadgeCriteriaType
  /** The field to check (e.g., 'totalPrompts', 'totalLikes') */
  field?: string
  /** The threshold value that must be met */
  threshold?: number
  /** For complex criteria, custom validation function name */
  customValidator?: string
  /** Additional parameters for custom validators */
  params?: Record<string, any>
}

/**
 * Types of badge criteria
 */
export enum BadgeCriteriaType {
  /** Simple numeric threshold (e.g., create 10 prompts) */
  THRESHOLD = 'threshold',
  /** Multiple conditions must be met */
  COMPOSITE = 'composite',
  /** Custom logic required */
  CUSTOM = 'custom',
  /** Time-based achievement */
  TIME_BASED = 'time_based',
  /** Ratio or percentage based */
  RATIO = 'ratio'
}

/**
 * User's earned badge instance
 */
export interface UserBadge {
  badgeId: string
  earnedAt: Date
  level?: number // For progressive badges
  progress?: number // Current progress towards next level (0-100)
}

/**
 * User statistics tracked for badge calculations
 */
export interface UserStats {
  totalPrompts: number
  totalLikes: number
  totalSaves: number
  totalFollowers: number
  totalFollowing: number
  consecutiveDays: number
  lastActiveDate: Date
  categoriesUsed: string[]
  agentsUsed: string[]
  accountCreatedAt: Date
  highestRatedPrompt?: number
  averageRating?: number
  promptsWithRating?: number
  viralPrompts: number // Prompts with 100+ likes
  weekendPrompts: number
  // Comment-related stats
  totalComments?: number
  totalCommentLikes?: number
  totalReplies?: number
  commentsWithReplies?: number
  uniqueUsersHelped?: number
}

/**
 * Badge check result
 */
export interface BadgeCheckResult {
  badgeId: string
  earned: boolean
  level?: number
  progress?: number
  previousLevel?: number
}

/**
 * Badge notification for UI
 */
export interface BadgeNotification {
  badge: BadgeDefinition
  level?: number
  earnedAt: Date
  isNew: boolean
}

/**
 * Badge display data with progress
 */
export interface BadgeDisplay extends BadgeDefinition {
  earned: boolean
  earnedAt?: Date
  level?: number
  progress?: number
  nextLevelThreshold?: number
}
