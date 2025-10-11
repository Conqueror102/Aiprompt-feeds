/**
 * Badged Avatar Component
 * 
 * Displays user avatar with tier-based colored border and badge icon overlay
 */

"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { BadgeTier } from '@/types/badge'
import { cn } from '@/lib/utils'

interface BadgedAvatarProps {
  userName: string
  userAvatar?: string
  highestTier?: BadgeTier
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showBadge?: boolean
}

const tierConfig = {
  [BadgeTier.LEGENDARY]: {
    border: 'ring-4 ring-yellow-400 dark:ring-yellow-500',
    glow: 'shadow-lg shadow-yellow-400/50',
    icon: '👑',
    name: 'Legendary',
    bg: 'bg-yellow-100 dark:bg-yellow-900'
  },
  [BadgeTier.EPIC]: {
    border: 'ring-4 ring-purple-400 dark:ring-purple-500',
    glow: 'shadow-lg shadow-purple-400/50',
    icon: '⚡',
    name: 'Epic',
    bg: 'bg-purple-100 dark:bg-purple-900'
  },
  [BadgeTier.RARE]: {
    border: 'ring-4 ring-blue-400 dark:ring-blue-500',
    glow: 'shadow-lg shadow-blue-400/50',
    icon: '💎',
    name: 'Rare',
    bg: 'bg-blue-100 dark:bg-blue-900'
  },
  [BadgeTier.UNCOMMON]: {
    border: 'ring-4 ring-green-400 dark:ring-green-500',
    glow: 'shadow-lg shadow-green-400/50',
    icon: '🌿',
    name: 'Uncommon',
    bg: 'bg-green-100 dark:bg-green-900'
  },
  [BadgeTier.COMMON]: {
    border: 'ring-4 ring-gray-400 dark:ring-gray-500',
    glow: 'shadow-md shadow-gray-400/30',
    icon: '🌱',
    name: 'Common',
    bg: 'bg-gray-100 dark:bg-gray-800'
  }
}

const sizeConfig = {
  sm: {
    avatar: 'h-8 w-8',
    badge: 'h-4 w-4 text-[10px]',
    position: '-bottom-0.5 -right-0.5'
  },
  md: {
    avatar: 'h-10 w-10',
    badge: 'h-5 w-5 text-xs',
    position: '-bottom-1 -right-1'
  },
  lg: {
    avatar: 'h-16 w-16',
    badge: 'h-6 w-6 text-sm',
    position: '-bottom-1 -right-1'
  },
  xl: {
    avatar: 'h-24 w-24',
    badge: 'h-8 w-8 text-base',
    position: '-bottom-2 -right-2'
  }
}

export default function BadgedAvatar({
  userName,
  userAvatar,
  highestTier,
  className,
  size = 'md',
  showBadge = true
}: BadgedAvatarProps) {
  const tierStyle = highestTier ? tierConfig[highestTier] : null
  const sizeStyle = sizeConfig[size]

  const avatarContent = (
    <div className={cn("relative inline-block", className)}>
      <Avatar 
        className={cn(
          sizeStyle.avatar,
          tierStyle?.border,
          tierStyle?.glow,
          "transition-all duration-200"
        )}
      >
        {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
        <AvatarFallback className={cn(
          "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200",
          tierStyle && tierStyle.bg
        )}>
          {userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      {showBadge && tierStyle && (
        <div 
          className={cn(
            "absolute flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900",
            sizeStyle.badge,
            sizeStyle.position,
            tierStyle.bg
          )}
          title={tierStyle.name}
        >
          <span className="leading-none">{tierStyle.icon}</span>
        </div>
      )}
    </div>
  )

  if (!tierStyle) {
    return avatarContent
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {avatarContent}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{tierStyle.name} Tier Member</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
