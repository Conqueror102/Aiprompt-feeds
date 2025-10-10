/**
 * Badge Showcase Component
 * 
 * Displays a user's top badges in a compact, attractive format
 * Perfect for user profiles, cards, and summary views
 */

"use client"

import { BadgeDisplay as BadgeDisplayType } from '@/types/badge'
import BadgeDisplay from './BadgeDisplay'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BadgeShowcaseProps {
  badges: BadgeDisplayType[]
  maxDisplay?: number
  showViewAll?: boolean
  onViewAll?: () => void
  title?: string
  className?: string
  compact?: boolean
}

export default function BadgeShowcase({
  badges,
  maxDisplay = 3,
  showViewAll = true,
  onViewAll,
  title = "Badges",
  className,
  compact = false
}: BadgeShowcaseProps) {
  // Filter to only earned badges and sort by tier/date
  const earnedBadges = badges
    .filter(badge => badge.earned)
    .sort((a, b) => {
      // Sort by tier first (legendary > epic > rare > uncommon > common)
      const tierOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common']
      const aTierIndex = tierOrder.indexOf(a.tier)
      const bTierIndex = tierOrder.indexOf(b.tier)
      
      if (aTierIndex !== bTierIndex) {
        return aTierIndex - bTierIndex
      }
      
      // Then by earned date (most recent first)
      if (a.earnedAt && b.earnedAt) {
        return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
      }
      
      return 0
    })

  const displayBadges = earnedBadges.slice(0, maxDisplay)
  const remainingCount = Math.max(0, earnedBadges.length - maxDisplay)

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {displayBadges.map((badge) => (
          <BadgeDisplay
            key={badge.id}
            badge={badge}
            size="sm"
          />
        ))}
        {remainingCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            +{remainingCount}
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <h3 className="font-semibold text-sm">{title}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({earnedBadges.length})
            </span>
          </div>
          {showViewAll && earnedBadges.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-xs"
            >
              View All
            </Button>
          )}
        </div>

        {earnedBadges.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No badges earned yet</p>
            <p className="text-xs mt-1">Start creating prompts to earn your first badge!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {displayBadges.map((badge) => (
                <BadgeDisplay
                  key={badge.id}
                  badge={badge}
                  size="md"
                />
              ))}
            </div>
            
            {remainingCount > 0 && (
              <div className="flex items-center justify-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewAll}
                  className="text-xs text-gray-600 dark:text-gray-300"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {remainingCount} more badge{remainingCount > 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Mini Badge Showcase for very compact displays
 */
export function MiniBadgeShowcase({
  badges,
  maxDisplay = 2,
  className
}: {
  badges: BadgeDisplayType[]
  maxDisplay?: number
  className?: string
}) {
  const earnedBadges = badges.filter(badge => badge.earned)
  const displayBadges = earnedBadges.slice(0, maxDisplay)
  const remainingCount = Math.max(0, earnedBadges.length - maxDisplay)

  if (earnedBadges.length === 0) {
    return null
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {displayBadges.map((badge) => (
        <div
          key={badge.id}
          className="text-lg"
          title={badge.name}
        >
          {badge.icon}
        </div>
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
          +{remainingCount}
        </span>
      )}
    </div>
  )
}

/**
 * Badge Progress Showcase - shows progress towards next badges
 */
export function BadgeProgressShowcase({
  badges,
  maxDisplay = 3,
  className
}: {
  badges: BadgeDisplayType[]
  maxDisplay?: number
  className?: string
}) {
  // Get badges with progress (not yet earned but have progress)
  const progressBadges = badges
    .filter(badge => !badge.earned && badge.progress && badge.progress > 0)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, maxDisplay)

  if (progressBadges.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-sm">Next Badges</h3>
        </div>

        <div className="space-y-3">
          {progressBadges.map((badge) => (
            <div key={badge.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-75">{badge.icon}</span>
                  <span className="text-sm font-medium">{badge.name}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(badge.progress || 0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${badge.progress || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
