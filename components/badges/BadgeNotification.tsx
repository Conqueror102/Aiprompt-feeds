/**
 * Badge Notification Component
 * 
 * Shows toast notifications when users earn new badges
 */

"use client"

import { useEffect } from 'react'
import { BadgeNotification as BadgeNotificationType } from '@/types/badge'
import { toast } from 'sonner'
import { Trophy, Star, Zap } from 'lucide-react'

interface BadgeNotificationProps {
  notifications: BadgeNotificationType[]
  onDismiss?: (badgeId: string) => void
}

export default function BadgeNotification({ 
  notifications, 
  onDismiss 
}: BadgeNotificationProps) {
  useEffect(() => {
    notifications.forEach((notification) => {
      const { badge, level, isNew } = notification
      
      const icon = isNew ? <Trophy className="w-5 h-5" /> : <Star className="w-5 h-5" />
      const title = isNew ? 'New Badge Earned!' : 'Badge Upgraded!'
      
      const message = (
        <div className="flex items-center gap-3">
          <div className="text-2xl">{badge.icon}</div>
          <div>
            <div className="font-semibold">
              {badge.name}
              {level && level > 1 && (
                <span className="ml-1 text-sm opacity-75">Level {level}</span>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {badge.description}
            </div>
          </div>
        </div>
      )

      toast.success(message, {
        duration: 5000,
        icon,
        description: title,
        action: onDismiss ? {
          label: 'View',
          onClick: () => onDismiss(badge.id)
        } : undefined
      })
    })
  }, [notifications, onDismiss])

  return null // This component only handles notifications, no UI
}

/**
 * Hook to show badge notifications
 */
export function useBadgeNotifications() {
  const showBadgeNotification = (notification: BadgeNotificationType) => {
    const { badge, level, isNew } = notification
    
    const icon = isNew ? <Trophy className="w-5 h-5" /> : <Star className="w-5 h-5" />
    const title = isNew ? 'New Badge Earned!' : 'Badge Upgraded!'
    
    const message = (
      <div className="flex items-center gap-3">
        <div className="text-2xl">{badge.icon}</div>
        <div>
          <div className="font-semibold">
            {badge.name}
            {level && level > 1 && (
              <span className="ml-1 text-sm opacity-75">Level {level}</span>
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {badge.description}
          </div>
        </div>
      </div>
    )

    toast.success(message, {
      duration: 5000,
      icon,
      description: title
    })
  }

  const showMultipleBadgeNotifications = (notifications: BadgeNotificationType[]) => {
    if (notifications.length === 0) return

    if (notifications.length === 1) {
      showBadgeNotification(notifications[0])
      return
    }

    // Show summary for multiple badges
    const newBadges = notifications.filter(n => n.isNew).length
    const upgrades = notifications.length - newBadges

    let title = ''
    if (newBadges > 0 && upgrades > 0) {
      title = `${newBadges} new badges, ${upgrades} upgrades!`
    } else if (newBadges > 0) {
      title = `${newBadges} new badge${newBadges > 1 ? 's' : ''} earned!`
    } else {
      title = `${upgrades} badge${upgrades > 1 ? 's' : ''} upgraded!`
    }

    const message = (
      <div className="space-y-2">
        <div className="font-semibold">{title}</div>
        <div className="space-y-1">
          {notifications.slice(0, 3).map((notification) => (
            <div key={notification.badge.id} className="flex items-center gap-2 text-sm">
              <span>{notification.badge.icon}</span>
              <span>{notification.badge.name}</span>
              {notification.level && notification.level > 1 && (
                <span className="text-xs opacity-75">Lv.{notification.level}</span>
              )}
            </div>
          ))}
          {notifications.length > 3 && (
            <div className="text-xs text-gray-500">
              +{notifications.length - 3} more...
            </div>
          )}
        </div>
      </div>
    )

    toast.success(message, {
      duration: 7000,
      icon: <Zap className="w-5 h-5" />
    })
  }

  return {
    showBadgeNotification,
    showMultipleBadgeNotifications
  }
}
