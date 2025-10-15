/**
 * LeaderboardFilters Component
 * 
 * Filter controls for leaderboard (period, category, tier, search)
 */

'use client'

import { useState } from 'react'
import { LeaderboardType, LeaderboardPeriod } from '@/types/leaderboard'
import { BadgeCategory, BadgeTier } from '@/types/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardFiltersProps {
  currentType: LeaderboardType
  currentPeriod: LeaderboardPeriod
  currentCategory?: BadgeCategory
  currentTier?: BadgeTier
  onTypeChange: (type: LeaderboardType) => void
  onPeriodChange: (period: LeaderboardPeriod) => void
  onCategoryChange: (category: BadgeCategory | undefined) => void
  onTierChange: (tier: BadgeTier | undefined) => void
  onSearchChange: (query: string) => void
}

export function LeaderboardFilters({
  currentType,
  currentPeriod,
  currentCategory,
  currentTier,
  onTypeChange,
  onPeriodChange,
  onCategoryChange,
  onTierChange,
  onSearchChange,
}: LeaderboardFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearchChange(searchQuery)
  }

  const handlePeriodClick = (period: LeaderboardPeriod) => {
    onPeriodChange(period)
  }

  return (
    <div className="space-y-4">
      {/* Period Tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.values(LeaderboardPeriod).map((period) => (
          <Button
            key={period}
            variant={currentPeriod === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePeriodClick(period)}
          >
            {getPeriodLabel(period)}
          </Button>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" size="icon" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Advanced Filters Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full"
      >
        <Filter className="mr-2 h-4 w-4" />
        {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
      </Button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
          {/* Leaderboard Type */}
          <div className="space-y-2">
            <Label>Leaderboard Type</Label>
            <Select
              value={currentType}
              onValueChange={(value) => {
                const newType = value as LeaderboardType
                onTypeChange(newType)
                
                // Auto-select first option when switching to category/tier mode
                if (newType === LeaderboardType.CATEGORY && !currentCategory) {
                  onCategoryChange(BadgeCategory.CONTENT_CREATION)
                } else if (newType === LeaderboardType.TIER && !currentTier) {
                  onTierChange(BadgeTier.COMMON)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LeaderboardType.OVERALL}>Overall</SelectItem>
                <SelectItem value={LeaderboardType.WEEKLY}>Weekly</SelectItem>
                <SelectItem value={LeaderboardType.MONTHLY}>Monthly</SelectItem>
                <SelectItem value={LeaderboardType.YEARLY}>Yearly</SelectItem>
                <SelectItem value={LeaderboardType.CATEGORY}>By Category</SelectItem>
                <SelectItem value={LeaderboardType.TIER}>By Tier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          {currentType === LeaderboardType.CATEGORY && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={currentCategory}
                onValueChange={(value) =>
                  onCategoryChange(value as BadgeCategory)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BadgeCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tier Filter */}
          {currentType === LeaderboardType.TIER && (
            <div className="space-y-2">
              <Label>Tier</Label>
              <Select
                value={currentTier}
                onValueChange={(value) => onTierChange(value as BadgeTier)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BadgeTier).map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {getTierLabel(tier)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Helper functions
function getPeriodLabel(period: LeaderboardPeriod): string {
  const labels: Record<LeaderboardPeriod, string> = {
    [LeaderboardPeriod.ALL_TIME]: '🏆 All Time',
    [LeaderboardPeriod.WEEKLY]: '📅 This Week',
    [LeaderboardPeriod.MONTHLY]: '📆 This Month',
    [LeaderboardPeriod.YEARLY]: '🗓️ This Year',
  }
  return labels[period]
}

function getCategoryLabel(category: BadgeCategory): string {
  const labels: Record<BadgeCategory, string> = {
    [BadgeCategory.CONTENT_CREATION]: '✍️ Content Creation',
    [BadgeCategory.ENGAGEMENT]: '❤️ Engagement',
    [BadgeCategory.SOCIAL]: '👥 Social',
    [BadgeCategory.TIME_BASED]: '⏰ Time-Based',
    [BadgeCategory.SPECIALTY]: '⭐ Specialty',
    [BadgeCategory.MILESTONE]: '🎯 Milestone',
  }
  return labels[category]
}

function getTierLabel(tier: BadgeTier): string {
  const labels: Record<BadgeTier, string> = {
    [BadgeTier.LEGENDARY]: '🏆 Legendary',
    [BadgeTier.EPIC]: '💎 Epic',
    [BadgeTier.RARE]: '💠 Rare',
    [BadgeTier.UNCOMMON]: '🔷 Uncommon',
    [BadgeTier.COMMON]: '⚪ Common',
  }
  return labels[tier]
}
