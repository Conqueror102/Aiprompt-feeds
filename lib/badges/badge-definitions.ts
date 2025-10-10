/**
 * Badge Definitions
 * 
 * This file contains all badge definitions for the AI Prompt Hub.
 * Badges are organized by category and tier for easy management.
 */

import { BadgeDefinition, BadgeTier, BadgeCategory, BadgeCriteriaType } from '@/types/badge'

/**
 * Content Creation Badges - Rewards for creating prompts
 */
export const CONTENT_CREATION_BADGES: BadgeDefinition[] = [
  {
    id: 'first_prompt',
    name: 'First Steps',
    description: 'Created your first prompt',
    icon: '🌱',
    tier: BadgeTier.COMMON,
    category: BadgeCategory.CONTENT_CREATION,
    criteria: {
      type: BadgeCriteriaType.THRESHOLD,
      field: 'totalPrompts',
      threshold: 1
    }
  },
  {
    id: 'prolific_creator',
    name: 'Prolific Creator',
    description: 'Created multiple prompts',
    icon: '📝',
    tier: BadgeTier.UNCOMMON,
    category: BadgeCategory.CONTENT_CREATION,
    isProgressive: true,
    criteria: {
      type: BadgeCriteriaType.THRESHOLD,
      field: 'totalPrompts'
    },
    levels: [
      { level: 1, name: 'Bronze Creator', threshold: 10, tier: BadgeTier.COMMON },
      { level: 2, name: 'Silver Creator', threshold: 50, tier: BadgeTier.UNCOMMON },
      { level: 3, name: 'Gold Creator', threshold: 100, tier: BadgeTier.RARE },
      { level: 4, name: 'Platinum Creator', threshold: 500, tier: BadgeTier.EPIC }
    ]
  },
  {
    id: 'multi_agent_master',
    name: 'Multi-Agent Master',
    description: 'Created prompts for 5+ different AI agents',
    icon: '🤖',
    tier: BadgeTier.RARE,
    category: BadgeCategory.CONTENT_CREATION,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkAgentDiversity',
      params: { minAgents: 5 }
    }
  },
  {
    id: 'category_explorer',
    name: 'Category Explorer',
    description: 'Created prompts in 5+ different categories',
    icon: '🗺️',
    tier: BadgeTier.RARE,
    category: BadgeCategory.CONTENT_CREATION,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkCategoryDiversity',
      params: { minCategories: 5 }
    }
  },
  {
    id: 'quality_craftsman',
    name: 'Quality Craftsman',
    description: 'Maintain 4.5+ star average rating across 10+ rated prompts',
    icon: '⭐',
    tier: BadgeTier.EPIC,
    category: BadgeCategory.CONTENT_CREATION,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkQualityRating',
      params: { minRating: 4.5, minPrompts: 10 }
    }
  }
]

/**
 * Engagement Badges - Rewards for community interaction
 */
export const ENGAGEMENT_BADGES: BadgeDefinition[] = [
  {
    id: 'popular_creator',
    name: 'Popular Creator',
    description: 'Received likes across all prompts',
    icon: '❤️',
    tier: BadgeTier.UNCOMMON,
    category: BadgeCategory.ENGAGEMENT,
    isProgressive: true,
    criteria: {
      type: BadgeCriteriaType.THRESHOLD,
      field: 'totalLikes'
    },
    levels: [
      { level: 1, name: 'Liked', threshold: 100, tier: BadgeTier.COMMON },
      { level: 2, name: 'Well-Liked', threshold: 500, tier: BadgeTier.UNCOMMON },
      { level: 3, name: 'Beloved', threshold: 1000, tier: BadgeTier.RARE },
      { level: 4, name: 'Adored', threshold: 5000, tier: BadgeTier.EPIC }
    ]
  },
  {
    id: 'bookmarked',
    name: 'Bookmarked',
    description: 'Prompts saved by other users',
    icon: '🔖',
    tier: BadgeTier.UNCOMMON,
    category: BadgeCategory.ENGAGEMENT,
    isProgressive: true,
    criteria: {
      type: BadgeCriteriaType.THRESHOLD,
      field: 'totalSaves'
    },
    levels: [
      { level: 1, name: 'Saved', threshold: 50, tier: BadgeTier.COMMON },
      { level: 2, name: 'Bookmarked', threshold: 200, tier: BadgeTier.UNCOMMON },
      { level: 3, name: 'Treasured', threshold: 500, tier: BadgeTier.RARE },
      { level: 4, name: 'Essential', threshold: 1000, tier: BadgeTier.EPIC }
    ]
  },
  {
    id: 'viral_hit',
    name: 'Viral Hit',
    description: 'Created a prompt with 100+ likes',
    icon: '🚀',
    tier: BadgeTier.RARE,
    category: BadgeCategory.ENGAGEMENT,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkViralPrompt',
      params: { minLikes: 100 }
    }
  }
]

/**
 * Social Badges - Rewards for community building
 */
export const SOCIAL_BADGES: BadgeDefinition[] = [
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Gained followers in the community',
    icon: '👑',
    tier: BadgeTier.RARE,
    category: BadgeCategory.SOCIAL,
    isProgressive: true,
    criteria: {
      type: BadgeCriteriaType.THRESHOLD,
      field: 'totalFollowers'
    },
    levels: [
      { level: 1, name: 'Rising Star', threshold: 50, tier: BadgeTier.UNCOMMON },
      { level: 2, name: 'Influencer', threshold: 100, tier: BadgeTier.RARE },
      { level: 3, name: 'Celebrity', threshold: 500, tier: BadgeTier.EPIC },
      { level: 4, name: 'Legend', threshold: 1000, tier: BadgeTier.LEGENDARY }
    ]
  },
  {
    id: 'networker',
    name: 'Networker',
    description: 'Following 50+ users',
    icon: '🤝',
    tier: BadgeTier.UNCOMMON,
    category: BadgeCategory.SOCIAL,
    criteria: {
      type: BadgeCriteriaType.THRESHOLD,
      field: 'totalFollowing',
      threshold: 50
    }
  },
  {
    id: 'community_builder',
    name: 'Community Builder',
    description: '100+ followers and following 50+ users',
    icon: '🏗️',
    tier: BadgeTier.EPIC,
    category: BadgeCategory.SOCIAL,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkCommunityBuilder',
      params: { minFollowers: 100, minFollowing: 50 }
    }
  }
]

/**
 * Time-Based Badges - Rewards for consistency and longevity
 */
export const TIME_BASED_BADGES: BadgeDefinition[] = [
  {
    id: 'pioneer',
    name: 'Pioneer',
    description: 'Among the first 100 users',
    icon: '🏴‍☠️',
    tier: BadgeTier.LEGENDARY,
    category: BadgeCategory.TIME_BASED,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkPioneerStatus',
      params: { maxUserCount: 100 }
    }
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Long-time community member',
    icon: '🎖️',
    tier: BadgeTier.RARE,
    category: BadgeCategory.TIME_BASED,
    isProgressive: true,
    criteria: {
      type: BadgeCriteriaType.TIME_BASED,
      field: 'accountAge'
    },
    levels: [
      { level: 1, name: 'Established', threshold: 180, tier: BadgeTier.UNCOMMON }, // 6 months
      { level: 2, name: 'Veteran', threshold: 365, tier: BadgeTier.RARE }, // 1 year
      { level: 3, name: 'Elder', threshold: 730, tier: BadgeTier.EPIC } // 2 years
    ]
  },
  {
    id: 'consistent_contributor',
    name: 'Consistent Contributor',
    description: 'Created prompts for consecutive days',
    icon: '📅',
    tier: BadgeTier.RARE,
    category: BadgeCategory.TIME_BASED,
    isProgressive: true,
    criteria: {
      type: BadgeCriteriaType.THRESHOLD,
      field: 'consecutiveDays'
    },
    levels: [
      { level: 1, name: 'Week Warrior', threshold: 7, tier: BadgeTier.COMMON },
      { level: 2, name: 'Month Master', threshold: 30, tier: BadgeTier.UNCOMMON },
      { level: 3, name: 'Quarter Champion', threshold: 90, tier: BadgeTier.RARE },
      { level: 4, name: 'Year Legend', threshold: 365, tier: BadgeTier.LEGENDARY }
    ]
  }
]

/**
 * Comment Badges - Rewards for community engagement through comments
 */
export const COMMENT_BADGES: BadgeDefinition[] = [
  {
    id: 'first_comment',
    name: 'First Comment',
    description: 'Left your first comment on a prompt',
    icon: '💬',
    tier: BadgeTier.COMMON,
    category: BadgeCategory.ENGAGEMENT,
    criteria: {
      type: BadgeCriteriaType.THRESHOLD,
      field: 'totalComments',
      threshold: 1
    }
  },
  {
    id: 'conversationalist',
    name: 'Conversationalist',
    description: 'Active in community discussions',
    icon: '🗣️',
    tier: BadgeTier.UNCOMMON,
    category: BadgeCategory.ENGAGEMENT,
    isProgressive: true,
    criteria: {
      type: BadgeCriteriaType.THRESHOLD,
      field: 'totalComments'
    },
    levels: [
      { level: 1, name: 'Chatter', threshold: 10, tier: BadgeTier.COMMON },
      { level: 2, name: 'Conversationalist', threshold: 50, tier: BadgeTier.UNCOMMON },
      { level: 3, name: 'Discussion Leader', threshold: 100, tier: BadgeTier.RARE },
      { level: 4, name: 'Community Voice', threshold: 500, tier: BadgeTier.EPIC }
    ]
  },
  {
    id: 'helpful_commenter',
    name: 'Helpful Commenter',
    description: 'Comments that receive lots of likes',
    icon: '👍',
    tier: BadgeTier.RARE,
    category: BadgeCategory.ENGAGEMENT,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkHelpfulCommenter',
      params: { minLikes: 10, minComments: 5 }
    }
  },
  {
    id: 'discussion_starter',
    name: 'Discussion Starter',
    description: 'Comments that spark conversations',
    icon: '🔥',
    tier: BadgeTier.RARE,
    category: BadgeCategory.ENGAGEMENT,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkDiscussionStarter',
      params: { minReplies: 5, minComments: 3 }
    }
  },
  {
    id: 'community_helper',
    name: 'Community Helper',
    description: 'Actively helps other users through replies',
    icon: '🤝',
    tier: BadgeTier.EPIC,
    category: BadgeCategory.SOCIAL,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkCommunityHelper',
      params: { minReplies: 20, minUniqueUsers: 10 }
    }
  }
]

/**
 * Specialty Badges - Rewards for expertise in specific areas
 */
export const SPECIALTY_BADGES: BadgeDefinition[] = [
  {
    id: 'chatgpt_master',
    name: 'ChatGPT Master',
    description: 'Expert in ChatGPT prompts',
    icon: '🤖',
    tier: BadgeTier.RARE,
    category: BadgeCategory.SPECIALTY,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkAgentSpecialty',
      params: { agent: 'ChatGPT', minPrompts: 50 }
    }
  },
  {
    id: 'claude_expert',
    name: 'Claude Expert',
    description: 'Expert in Claude prompts',
    icon: '🧠',
    tier: BadgeTier.RARE,
    category: BadgeCategory.SPECIALTY,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkAgentSpecialty',
      params: { agent: 'Claude', minPrompts: 50 }
    }
  },
  {
    id: 'image_wizard',
    name: 'Image Wizard',
    description: 'Master of image generation prompts',
    icon: '🎨',
    tier: BadgeTier.RARE,
    category: BadgeCategory.SPECIALTY,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkImageGeneration',
      params: { minPrompts: 20 }
    }
  },
  {
    id: 'code_whisperer',
    name: 'Code Whisperer',
    description: 'Expert in development prompts',
    icon: '👨‍💻',
    tier: BadgeTier.RARE,
    category: BadgeCategory.SPECIALTY,
    criteria: {
      type: BadgeCriteriaType.CUSTOM,
      customValidator: 'checkCategorySpecialty',
      params: { category: 'Development', minPrompts: 20 }
    }
  }
]

/**
 * All badge definitions combined
 */
export const ALL_BADGES: BadgeDefinition[] = [
  ...CONTENT_CREATION_BADGES,
  ...ENGAGEMENT_BADGES,
  ...SOCIAL_BADGES,
  ...TIME_BASED_BADGES,
  ...COMMENT_BADGES,
  ...SPECIALTY_BADGES
]

/**
 * Badge definitions indexed by ID for quick lookup
 */
export const BADGE_DEFINITIONS_MAP = new Map<string, BadgeDefinition>(
  ALL_BADGES.map(badge => [badge.id, badge])
)

/**
 * Get badge definition by ID
 */
export function getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS_MAP.get(badgeId)
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return ALL_BADGES.filter(badge => badge.category === category)
}

/**
 * Get badges by tier
 */
export function getBadgesByTier(tier: BadgeTier): BadgeDefinition[] {
  return ALL_BADGES.filter(badge => badge.tier === tier)
}
