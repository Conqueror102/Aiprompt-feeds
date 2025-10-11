/**
 * Hook to get user's highest badge tier
 */

import { useMemo } from 'react'
import { BadgeDisplay, BadgeTier } from '@/types/badge'

const tierOrder = [
  BadgeTier.LEGENDARY,
  BadgeTier.EPIC,
  BadgeTier.RARE,
  BadgeTier.UNCOMMON,
  BadgeTier.COMMON
]

export function useHighestTier(badges: BadgeDisplay[]): BadgeTier | undefined {
  return useMemo(() => {
    // Filter to only earned badges
    const earnedBadges = badges.filter(badge => badge.earned)
    
    if (earnedBadges.length === 0) {
      return undefined
    }

    // Find the highest tier
    for (const tier of tierOrder) {
      const hasTier = earnedBadges.some(badge => badge.tier === tier)
      if (hasTier) {
        return tier
      }
    }

    return undefined
  }, [badges])
}
