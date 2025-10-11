/**
 * Server-side utility to get user's highest badge tier
 */

import { BadgeTier } from '@/types/badge'
import { ALL_BADGES } from './badge-definitions'

interface UserBadge {
  badgeId: string
  earnedAt?: Date
  level?: number
}

const tierOrder = [
  BadgeTier.LEGENDARY,
  BadgeTier.EPIC,
  BadgeTier.RARE,
  BadgeTier.UNCOMMON,
  BadgeTier.COMMON
]

/**
 * Get the highest badge tier for a user based on their earned badges
 */
export function getHighestTier(userBadges: UserBadge[]): BadgeTier | undefined {
  if (!userBadges || userBadges.length === 0) {
    return undefined
  }

  // Get all badge definitions
  const badgeDefinitions = new Map(ALL_BADGES.map(badge => [badge.id, badge]))

  // Find highest tier among earned badges
  for (const tier of tierOrder) {
    const hasTier = userBadges.some(userBadge => {
      const badgeDef = badgeDefinitions.get(userBadge.badgeId)
      if (!badgeDef) return false

      // For progressive badges, check the level's tier
      if (badgeDef.isProgressive && badgeDef.levels && userBadge.level) {
        const levelDef = badgeDef.levels.find(l => l.level === userBadge.level)
        return levelDef?.tier === tier
      }

      // For regular badges, check the badge's tier
      return badgeDef.tier === tier
    })

    if (hasTier) {
      return tier
    }
  }

  return undefined
}
