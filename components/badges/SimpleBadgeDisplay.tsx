/**
 * Simple Badge Display Component
 * 
 * Shows only earned badge icons with hover tooltips
 * Perfect for profile pages - clean and minimal
 */

"use client"

import { BadgeDisplay as BadgeDisplayType, BadgeTier } from '@/types/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SimpleBadgeDisplayProps {
  badges: BadgeDisplayType[]
  className?: string
}

const tierStyles = {
  [BadgeTier.COMMON]: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600',
  [BadgeTier.UNCOMMON]: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600',
  [BadgeTier.RARE]: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600',
  [BadgeTier.EPIC]: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600',
  [BadgeTier.LEGENDARY]: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600'
}

export default function SimpleBadgeDisplay({ badges, className }: SimpleBadgeDisplayProps) {
  // Only show earned badges
  const earnedBadges = badges.filter(badge => badge.earned)

  if (earnedBadges.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No badges earned yet</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <TooltipProvider>
        {earnedBadges.map((badge) => (
          <Tooltip key={badge.id}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center justify-center w-16 h-16 rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg",
                  tierStyles[badge.tier]
                )}
              >
                <span className="text-3xl">{badge.icon}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-semibold">
                  {badge.name}
                  {badge.level && badge.level > 1 && (
                    <span className="ml-1 text-xs opacity-75">Level {badge.level}</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {badge.description}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                  <span className="capitalize">{badge.tier.replace('_', ' ')}</span>
                  {badge.earnedAt && (
                    <span className="ml-2">
                      • Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}
