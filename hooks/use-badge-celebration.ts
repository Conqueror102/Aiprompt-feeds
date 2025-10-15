/**
 * Badge Celebration Hook
 * 
 * Hook to show celebration animations and notifications when badges are earned
 */

import { useCallback, useEffect } from 'react'
import { BadgeNotification } from '@/types/badge'
import { toast } from '@/hooks/use-toast'
import {
  showBadgeCelebration,
  getBadgeNotificationTitle,
  getBadgeNotificationMessage,
  getBadgeTierEmoji,
} from '@/lib/badge-notification'

export function useBadgeCelebration() {
  /**
   * Show celebration for a single badge
   */
  const celebrate = useCallback(async (notification: BadgeNotification) => {
    // Show confetti animation
    await showBadgeCelebration(notification)

    // Show toast notification
    const title = getBadgeNotificationTitle(notification)
    const description = getBadgeNotificationMessage(notification)
    
    toast({
      title,
      description,
      duration: 6000, // Show longer for important achievements
      className: `border-2 ${getTierClassName(notification.badge.tier)}`,
    })
  }, [])

  /**
   * Show celebrations for multiple badges
   */
  const celebrateMultiple = useCallback(async (notifications: BadgeNotification[]) => {
    if (notifications.length === 0) return

    // Show celebration for each badge with a slight delay
    for (let i = 0; i < notifications.length; i++) {
      setTimeout(() => {
        celebrate(notifications[i])
      }, i * 1500) // Stagger celebrations by 1.5 seconds
    }
  }, [celebrate])

  /**
   * Check for new badges in API response and celebrate
   */
  const checkAndCelebrate = useCallback((response: any) => {
    if (response?.newBadges && Array.isArray(response.newBadges) && response.newBadges.length > 0) {
      celebrateMultiple(response.newBadges)
    }
  }, [celebrateMultiple])

  return {
    celebrate,
    celebrateMultiple,
    checkAndCelebrate,
  }
}

/**
 * Get Tailwind classes for badge tier styling
 */
function getTierClassName(tier: string): string {
  switch (tier) {
    case 'legendary':
      return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
    case 'epic':
      return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
    case 'rare':
      return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    case 'uncommon':
      return 'border-green-500 bg-green-50 dark:bg-green-900/20'
    default:
      return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
  }
}
