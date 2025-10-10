/**
 * Badge Display Component
 * 
 * Displays individual badges with proper styling based on tier
 */

"use client"

import { BadgeDisplay as BadgeDisplayType, BadgeTier } from '@/types/badge'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface BadgeDisplayProps {
  badge: BadgeDisplayType
  size?: 'sm' | 'md' | 'lg'
  showProgress?: boolean
  className?: string
}

const tierStyles = {
  [BadgeTier.COMMON]: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200',
  [BadgeTier.UNCOMMON]: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200',
  [BadgeTier.RARE]: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200',
  [BadgeTier.EPIC]: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200',
  [BadgeTier.LEGENDARY]: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200'
}

const sizeStyles = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2'
}

export default function BadgeDisplay({ 
  badge, 
  size = 'md', 
  showProgress = false,
  className 
}: BadgeDisplayProps) {
  const tierStyle = tierStyles[badge.tier]
  const sizeStyle = sizeStyles[size]
  
  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        tierStyle,
        sizeStyle,
        'font-medium transition-all duration-200',
        badge.earned ? 'opacity-100' : 'opacity-50 grayscale',
        className
      )}
    >
      <span className="mr-1.5">{badge.icon}</span>
      <span>
        {badge.name}
        {badge.level && badge.level > 1 && (
          <span className="ml-1 text-xs opacity-75">
            Lv.{badge.level}
          </span>
        )}
      </span>
    </Badge>
  )

  const tooltipContent = (
    <div className="max-w-xs">
      <div className="font-semibold mb-1">
        {badge.name}
        {badge.level && badge.level > 1 && (
          <span className="ml-1 text-xs opacity-75">Level {badge.level}</span>
        )}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        {badge.description}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <div className="capitalize">{badge.tier.replace('_', ' ')} • {badge.category.replace('_', ' ')}</div>
        {badge.earned && badge.earnedAt && (
          <div className="mt-1">
            Earned: {new Date(badge.earnedAt).toLocaleDateString()}
          </div>
        )}
        {showProgress && badge.progress !== undefined && !badge.earned && (
          <div className="mt-1">
            Progress: {Math.round(badge.progress)}%
            {badge.nextLevelThreshold && (
              <div className="text-xs mt-1">
                Next: {badge.nextLevelThreshold}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="z-50">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
