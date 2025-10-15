/**
 * Leaderboard Type Definitions
 * 
 * Defines interfaces and types for the badge leaderboard system.
 * Supports multiple leaderboard types, scoring systems, and filtering.
 */

import { BadgeDefinition, BadgeTier, BadgeCategory } from './badge'

/**
 * Types of leaderboards available
 */
export enum LeaderboardType {
  OVERALL = 'overall',           // All-time total score
  WEEKLY = 'weekly',             // Last 7 days
  MONTHLY = 'monthly',           // Last 30 days
  YEARLY = 'yearly',             // Last 365 days
  CATEGORY = 'category',         // Specific category
  TIER = 'tier',                 // Specific tier
}

/**
 * Time periods for leaderboards
 */
export enum LeaderboardPeriod {
  ALL_TIME = 'all_time',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

/**
 * Leaderboard entry representing a user's position
 */
export interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  avatar?: string
  totalScore: number
  badgeCount: number
  badgeBreakdown: BadgeBreakdown
  topBadges: BadgeWithDetails[]
  scoreChange?: number            // Change since last period
  percentile?: number             // Top X percentile
  joinedAt?: Date
}

/**
 * Breakdown of badges by tier
 */
export interface BadgeBreakdown {
  legendary: number
  epic: number
  rare: number
  uncommon: number
  common: number
}

/**
 * Badge with full details for display
 */
export interface BadgeWithDetails {
  badgeId: string
  definition: BadgeDefinition
  earnedAt: Date
  level?: number
  score: number                   // Individual badge score
}

/**
 * Filters for leaderboard queries
 */
export interface LeaderboardFilters {
  type: LeaderboardType
  period: LeaderboardPeriod
  category?: BadgeCategory
  tier?: BadgeTier
  limit: number
  offset: number
  searchQuery?: string
}

/**
 * User's rank information
 */
export interface UserRankInfo {
  userId: string
  rank: number
  score: number
  percentile: number
  badgeCount: number
  totalUsers: number
  nearby?: LeaderboardEntry[]     // Users around current user's rank
}

/**
 * Leaderboard metadata
 */
export interface LeaderboardMetadata {
  totalUsers: number
  totalPages: number
  currentPage: number
  period: LeaderboardPeriod
  type: LeaderboardType
  lastUpdated: Date
  category?: BadgeCategory
  tier?: BadgeTier
}

/**
 * Complete leaderboard response
 */
export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[]
  currentUser?: UserRankInfo
  metadata: LeaderboardMetadata
}

/**
 * Scoring configuration
 */
export interface ScoringConfig {
  tierWeights: Record<BadgeTier, number>
  levelMultipliers: Record<number, number>
  categoryBonuses: Record<BadgeCategory, number>
}

/**
 * Leaderboard statistics
 */
export interface LeaderboardStats {
  totalUsers: number
  totalBadgesAwarded: number
  averageBadgesPerUser: number
  topScore: number
  averageScore: number
  mostCommonBadge: string
  rarestBadge: string
}

/**
 * Default scoring configuration
 */
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  tierWeights: {
    [BadgeTier.LEGENDARY]: 1000,
    [BadgeTier.EPIC]: 500,
    [BadgeTier.RARE]: 200,
    [BadgeTier.UNCOMMON]: 50,
    [BadgeTier.COMMON]: 10,
  },
  levelMultipliers: {
    1: 1.0,
    2: 1.5,
    3: 2.0,
    4: 3.0,
    5: 5.0,
  },
  categoryBonuses: {
    [BadgeCategory.CONTENT_CREATION]: 1.2,
    [BadgeCategory.ENGAGEMENT]: 1.15,
    [BadgeCategory.SOCIAL]: 1.1,
    [BadgeCategory.SPECIALTY]: 1.25,
    [BadgeCategory.TIME_BASED]: 1.05,
    [BadgeCategory.MILESTONE]: 1.3,
  },
}
