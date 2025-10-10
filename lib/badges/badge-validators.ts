/**
 * Badge Validators
 * 
 * Custom validation functions for complex badge criteria.
 * Each validator receives user stats and parameters, returns boolean.
 */

import { UserStats } from '@/types/badge'
import { AI_AGENTS, CATEGORIES } from '@/lib/constants'

/**
 * Check if user has created prompts for minimum number of different AI agents
 */
export function checkAgentDiversity(stats: UserStats, params: { minAgents: number }): boolean {
  return stats.agentsUsed.length >= params.minAgents
}

/**
 * Check if user has created prompts in minimum number of different categories
 */
export function checkCategoryDiversity(stats: UserStats, params: { minCategories: number }): boolean {
  return stats.categoriesUsed.length >= params.minCategories
}

/**
 * Check if user maintains high quality rating across minimum number of prompts
 */
export function checkQualityRating(
  stats: UserStats, 
  params: { minRating: number; minPrompts: number }
): boolean {
  return (
    (stats.promptsWithRating || 0) >= params.minPrompts &&
    (stats.averageRating || 0) >= params.minRating
  )
}

/**
 * Check if user has at least one viral prompt (100+ likes)
 */
export function checkViralPrompt(stats: UserStats, params: { minLikes: number }): boolean {
  return stats.viralPrompts > 0
}

/**
 * Check if user qualifies as community builder (followers + following thresholds)
 */
export function checkCommunityBuilder(
  stats: UserStats, 
  params: { minFollowers: number; minFollowing: number }
): boolean {
  return (
    stats.totalFollowers >= params.minFollowers &&
    stats.totalFollowing >= params.minFollowing
  )
}

/**
 * Check if user is among the first N users (pioneer status)
 */
export function checkPioneerStatus(
  stats: UserStats, 
  params: { maxUserCount: number }
): boolean {
  // This would need to be implemented with a user count check
  // For now, we'll check account creation date as a proxy
  const pioneerCutoff = new Date('2024-01-01') // Adjust based on your launch date
  return stats.accountCreatedAt <= pioneerCutoff
}

/**
 * Check if user is specialist in specific AI agent
 */
export function checkAgentSpecialty(
  stats: UserStats,
  params: { agent: string; minPrompts: number }
): boolean {
  // This would require additional data about prompts per agent
  // For now, we'll use a simplified check
  return (
    stats.agentsUsed.includes(params.agent) &&
    stats.totalPrompts >= params.minPrompts
  )
}

/**
 * Check if user specializes in image generation
 */
export function checkImageGeneration(
  stats: UserStats,
  params: { minPrompts: number }
): boolean {
  const imageAgents = ['Stable Diffusion', 'DALL-E', 'Midjourney']
  const hasImageAgents = imageAgents.some(agent => stats.agentsUsed.includes(agent))
  const hasImageCategory = stats.categoriesUsed.includes('Image Generation')
  
  return (hasImageAgents || hasImageCategory) && stats.totalPrompts >= params.minPrompts
}

/**
 * Check if user specializes in specific category
 */
export function checkCategorySpecialty(
  stats: UserStats,
  params: { category: string; minPrompts: number }
): boolean {
  return (
    stats.categoriesUsed.includes(params.category) &&
    stats.totalPrompts >= params.minPrompts
  )
}

/**
 * Calculate account age in days
 */
export function calculateAccountAge(createdAt: Date): number {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createdAt.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Check if it's weekend (for weekend warrior badge)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

/**
 * Check if user is a helpful commenter (comments with high likes)
 */
export function checkHelpfulCommenter(
  stats: UserStats,
  params: { minLikes: number; minComments: number }
): boolean {
  return (
    (stats.totalComments || 0) >= params.minComments &&
    (stats.totalCommentLikes || 0) >= params.minLikes
  )
}

/**
 * Check if user starts discussions (comments that get replies)
 */
export function checkDiscussionStarter(
  stats: UserStats,
  params: { minReplies: number; minComments: number }
): boolean {
  return (
    (stats.totalComments || 0) >= params.minComments &&
    (stats.commentsWithReplies || 0) >= params.minReplies
  )
}

/**
 * Check if user is a community helper (replies to many different users)
 */
export function checkCommunityHelper(
  stats: UserStats,
  params: { minReplies: number; minUniqueUsers: number }
): boolean {
  return (
    (stats.totalReplies || 0) >= params.minReplies &&
    (stats.uniqueUsersHelped || 0) >= params.minUniqueUsers
  )
}

/**
 * Validator function registry
 * Maps validator names to their functions
 */
export const BADGE_VALIDATORS = {
  checkAgentDiversity,
  checkCategoryDiversity,
  checkQualityRating,
  checkViralPrompt,
  checkCommunityBuilder,
  checkPioneerStatus,
  checkAgentSpecialty,
  checkImageGeneration,
  checkCategorySpecialty,
  checkHelpfulCommenter,
  checkDiscussionStarter,
  checkCommunityHelper
} as const

/**
 * Execute a custom validator by name
 */
export function executeValidator(
  validatorName: string,
  stats: UserStats,
  params: Record<string, any>
): boolean {
  const validator = BADGE_VALIDATORS[validatorName as keyof typeof BADGE_VALIDATORS]
  
  if (!validator) {
    console.warn(`Badge validator '${validatorName}' not found`)
    return false
  }
  
  try {
    return validator(stats, params as any)
  } catch (error) {
    console.error(`Error executing badge validator '${validatorName}':`, error)
    return false
  }
}
