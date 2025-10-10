/**
 * Badge Triggers
 * 
 * Automatic badge checking triggers for various user actions.
 * This module integrates with existing API endpoints to check badges
 * whenever users perform relevant actions.
 */

import { BadgeService } from '@/services/badge-service'

// Interface for User document with proper typing
interface UserDocument {
  _id: string
  followers?: string[]
  following?: string[]
  stats?: any
  createdAt?: Date
  updatedAt?: Date
}

// Interface for Prompt document
interface PromptDocument {
  _id: string
  createdBy: {
    _id: string
    [key: string]: any
  }
  likes: number
  saves: number
  rating?: number
  [key: string]: any
}

/**
 * Trigger badge checks after prompt creation
 */
export async function triggerBadgesAfterPromptCreate(userId: string, promptData: any) {
  try {
    // Update user stats
    const user = await import('@/lib/models/User').then(m => m.default)
    const currentUser = await user.findById(userId) as UserDocument
    
    if (!currentUser) return

    // Increment prompt count
    await BadgeService.updateUserStats(userId, {
      totalPrompts: (currentUser.stats?.totalPrompts || 0) + 1,
      lastActiveDate: new Date()
    })

    // Add category and agents to user's used lists
    const categoriesUsed = [...new Set([
      ...(currentUser.stats?.categoriesUsed || []),
      promptData.category
    ])]
    
    const agentsUsed = [...new Set([
      ...(currentUser.stats?.agentsUsed || []),
      ...(promptData.aiAgents || [])
    ])]

    await BadgeService.updateUserStats(userId, {
      categoriesUsed,
      agentsUsed
    })

    // Check for weekend prompt
    const now = new Date()
    const isWeekend = now.getDay() === 0 || now.getDay() === 6
    if (isWeekend) {
      await BadgeService.updateUserStats(userId, {
        weekendPrompts: (currentUser.stats?.weekendPrompts || 0) + 1
      })
    }

    // Check badges
    const newBadges = await BadgeService.checkUserBadges(userId)
    return newBadges
  } catch (error) {
    console.error('Error triggering badges after prompt create:', error)
    return []
  }
}

/**
 * Trigger badge checks after prompt receives a like
 */
export async function triggerBadgesAfterPromptLike(promptId: string, userId: string) {
  try {
    const Prompt = await import('@/lib/models/Prompt').then(m => m.default)
    const prompt = await Prompt.findById(promptId).populate('createdBy') as PromptDocument
    
    if (!prompt || !prompt.createdBy) return []

    const promptOwnerId = prompt.createdBy._id.toString()
    
    // Update prompt owner's stats
    const User = await import('@/lib/models/User').then(m => m.default)
    const promptOwner = await User.findById(promptOwnerId) as UserDocument
    
    if (!promptOwner) return []

    // Calculate new total likes for the user
    const userPrompts = await Prompt.find({ createdBy: promptOwnerId })
    const totalLikes = userPrompts.reduce((sum, p) => sum + (p.likes || 0), 0)
    
    // Check if this prompt became viral (100+ likes)
    const wasViral = (prompt.likes - 1) < 100 && prompt.likes >= 100
    let viralPrompts = promptOwner.stats?.viralPrompts || 0
    if (wasViral) {
      viralPrompts += 1
    }

    await BadgeService.updateUserStats(promptOwnerId, {
      totalLikes,
      viralPrompts
    })

    // Check badges for prompt owner
    const newBadges = await BadgeService.checkUserBadges(promptOwnerId)
    return newBadges
  } catch (error) {
    console.error('Error triggering badges after prompt like:', error)
    return []
  }
}

/**
 * Trigger badge checks after prompt is saved
 */
export async function triggerBadgesAfterPromptSave(promptId: string, userId: string) {
  try {
    const Prompt = await import('@/lib/models/Prompt').then(m => m.default)
    const prompt = await Prompt.findById(promptId).populate('createdBy') as PromptDocument
    
    if (!prompt || !prompt.createdBy) return []

    const promptOwnerId = prompt.createdBy._id.toString()
    
    // Update prompt owner's stats
    const userPrompts = await Prompt.find({ createdBy: promptOwnerId })
    const totalSaves = userPrompts.reduce((sum, p) => sum + (p.saves || 0), 0)

    await BadgeService.updateUserStats(promptOwnerId, {
      totalSaves
    })

    // Check badges for prompt owner
    const newBadges = await BadgeService.checkUserBadges(promptOwnerId)
    return newBadges
  } catch (error) {
    console.error('Error triggering badges after prompt save:', error)
    return []
  }
}

/**
 * Trigger badge checks after user follows another user
 */
export async function triggerBadgesAfterFollow(followerId: string, followedId: string) {
  try {
    const User = await import('@/lib/models/User').then(m => m.default)
    
    // Update follower's stats (following count)
    const follower = await User.findById(followerId) as UserDocument
    if (follower) {
      await BadgeService.updateUserStats(followerId, {
        totalFollowing: follower.following?.length || 0
      })
    }

    // Update followed user's stats (followers count)
    const followed = await User.findById(followedId) as UserDocument
    if (followed) {
      await BadgeService.updateUserStats(followedId, {
        totalFollowers: followed.followers?.length || 0
      })
    }

    // Check badges for both users
    const followerBadges = follower ? await BadgeService.checkUserBadges(followerId) : []
    const followedBadges = followed ? await BadgeService.checkUserBadges(followedId) : []

    return {
      followerBadges,
      followedBadges
    }
  } catch (error) {
    console.error('Error triggering badges after follow:', error)
    return { followerBadges: [], followedBadges: [] }
  }
}

/**
 * Trigger badge checks after prompt rating
 */
export async function triggerBadgesAfterPromptRate(promptId: string, rating: number) {
  try {
    const Prompt = await import('@/lib/models/Prompt').then(m => m.default)
    const prompt = await Prompt.findById(promptId).populate('createdBy') as PromptDocument
    
    if (!prompt || !prompt.createdBy) return []

    const promptOwnerId = prompt.createdBy._id.toString()
    
    // Recalculate rating stats for the user
    const userPrompts = await Prompt.find({ 
      createdBy: promptOwnerId,
      rating: { $ne: null }
    })

    if (userPrompts.length === 0) return []

    const totalRating = userPrompts.reduce((sum, p) => sum + (p.rating || 0), 0)
    const averageRating = totalRating / userPrompts.length
    const highestRatedPrompt = Math.max(...userPrompts.map(p => p.rating || 0))

    await BadgeService.updateUserStats(promptOwnerId, {
      averageRating,
      highestRatedPrompt,
      promptsWithRating: userPrompts.length
    })

    // Check badges
    const newBadges = await BadgeService.checkUserBadges(promptOwnerId)
    return newBadges
  } catch (error) {
    console.error('Error triggering badges after prompt rate:', error)
    return []
  }
}

/**
 * Trigger badge checks after user login (for consecutive days tracking)
 */
export async function triggerBadgesAfterLogin(userId: string) {
  try {
    const User = await import('@/lib/models/User').then(m => m.default)
    const user = await User.findById(userId) as UserDocument
    
    if (!user) return []

    const now = new Date()
    const lastActive = user.stats?.lastActiveDate ? new Date(user.stats.lastActiveDate) : null
    
    let consecutiveDays = user.stats?.consecutiveDays || 0

    if (lastActive) {
      const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        // Consecutive day
        consecutiveDays += 1
      } else if (daysDiff > 1) {
        // Streak broken
        consecutiveDays = 1
      }
      // If daysDiff === 0, same day login, no change
    } else {
      // First login
      consecutiveDays = 1
    }

    await BadgeService.updateUserStats(userId, {
      consecutiveDays,
      lastActiveDate: now
    })

    // Check badges
    const newBadges = await BadgeService.checkUserBadges(userId)
    return newBadges
  } catch (error) {
    console.error('Error triggering badges after login:', error)
    return []
  }
}

/**
 * Daily cron job to check time-based badges
 */
export async function runDailyBadgeCheck() {
  try {
    const User = await import('@/lib/models/User').then(m => m.default)
    
    // Get all users (in production, you'd want to batch this)
    const users = await User.find({}).select('_id').lean() as { _id: string }[]
    
    const results = []
    
    for (const user of users) {
      try {
        const newBadges = await BadgeService.checkUserBadges(user._id)
        if (newBadges.length > 0) {
          results.push({
            userId: user._id,
            badges: newBadges
          })
        }
      } catch (error) {
        console.error(`Error checking badges for user ${user._id}:`, error)
      }
    }
    
    console.log(`Daily badge check completed. ${results.length} users earned new badges.`)
    return results
  } catch (error) {
    console.error('Error in daily badge check:', error)
    return []
  }
}

/**
 * Initialize user stats for new users
 */
export async function initializeUserStats(userId: string) {
  try {
    const initialStats = {
      totalPrompts: 0,
      totalLikes: 0,
      totalSaves: 0,
      totalFollowers: 0,
      totalFollowing: 0,
      consecutiveDays: 1,
      lastActiveDate: new Date(),
      categoriesUsed: [],
      agentsUsed: [],
      highestRatedPrompt: 0,
      averageRating: 0,
      promptsWithRating: 0,
      viralPrompts: 0,
      weekendPrompts: 0
    }

    await BadgeService.updateUserStats(userId, initialStats)
    
    // Check for initial badges (like "First Steps" when they create account)
    const newBadges = await BadgeService.checkUserBadges(userId)
    return newBadges
  } catch (error) {
    console.error('Error initializing user stats:', error)
    return []
  }
}
