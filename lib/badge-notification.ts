/**
 * Badge Notification Utility
 * 
 * Handles celebration notifications when users earn new badges
 */

import { BadgeNotification } from '@/types/badge'

// Dynamic import for confetti to avoid SSR issues
let confetti: any = null

// Lazy load confetti
const loadConfetti = async () => {
  if (!confetti && typeof window !== 'undefined') {
    const module = await import('canvas-confetti')
    confetti = module.default
  }
  return confetti
}

/**
 * Show a celebration for a newly earned badge
 */
export async function showBadgeCelebration(notification: BadgeNotification) {
  const canvas = await loadConfetti()
  
  if (!canvas) return

  const { badge, level, isNew } = notification

  // Different celebration intensity based on badge tier
  const getTierCelebration = () => {
    switch (badge.tier) {
      case 'legendary':
        return {
          particleCount: 200,
          spread: 180,
          startVelocity: 60,
          duration: 5000,
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        }
      case 'epic':
        return {
          particleCount: 150,
          spread: 150,
          startVelocity: 50,
          duration: 4000,
          colors: ['#9B59B6', '#8E44AD', '#E74C3C'],
        }
      case 'rare':
        return {
          particleCount: 100,
          spread: 120,
          startVelocity: 40,
          duration: 3000,
          colors: ['#3498DB', '#2980B9', '#1ABC9C'],
        }
      case 'uncommon':
        return {
          particleCount: 75,
          spread: 90,
          startVelocity: 30,
          duration: 2500,
          colors: ['#2ECC71', '#27AE60', '#16A085'],
        }
      default: // common
        return {
          particleCount: 50,
          spread: 70,
          startVelocity: 25,
          duration: 2000,
          colors: ['#95A5A6', '#7F8C8D', '#BDC3C7'],
        }
    }
  }

  const celebration = getTierCelebration()

  // Fire confetti
  const end = Date.now() + celebration.duration

  const frame = () => {
    canvas({
      particleCount: 3,
      angle: 60,
      spread: celebration.spread,
      origin: { x: 0, y: 0.6 },
      colors: celebration.colors,
      startVelocity: celebration.startVelocity,
    })
    canvas({
      particleCount: 3,
      angle: 120,
      spread: celebration.spread,
      origin: { x: 1, y: 0.6 },
      colors: celebration.colors,
      startVelocity: celebration.startVelocity,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}

/**
 * Get the appropriate emoji for a badge tier
 */
export function getBadgeTierEmoji(tier: string): string {
  switch (tier) {
    case 'legendary':
      return '🏆'
    case 'epic':
      return '⚡'
    case 'rare':
      return '💎'
    case 'uncommon':
      return '🌿'
    default:
      return '🌱'
  }
}

/**
 * Get the notification message based on badge type
 */
export function getBadgeNotificationMessage(notification: BadgeNotification): string {
  const { badge, level, isNew } = notification
  const emoji = getBadgeTierEmoji(badge.tier)
  
  if (isNew) {
    return `${emoji} Hooray! You earned the "${badge.name}" badge!`
  } else if (level) {
    return `${emoji} Level Up! "${badge.name}" upgraded to Level ${level}!`
  }
  
  return `${emoji} Badge earned: ${badge.name}`
}

/**
 * Get the notification title based on badge tier
 */
export function getBadgeNotificationTitle(notification: BadgeNotification): string {
  const { badge, isNew } = notification
  
  if (badge.tier === 'legendary') {
    return '🎊 LEGENDARY ACHIEVEMENT! 🎊'
  } else if (badge.tier === 'epic') {
    return '⚡ EPIC BADGE EARNED! ⚡'
  } else if (badge.tier === 'rare') {
    return '💎 RARE BADGE UNLOCKED! 💎'
  } else if (isNew) {
    return '🎉 Badge Earned!'
  } else {
    return '📈 Badge Upgraded!'
  }
}
