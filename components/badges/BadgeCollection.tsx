/**
 * Badge Collection Component
 * 
 * Displays a user's complete badge collection with filtering and sorting
 */

"use client"

import { useState, useMemo } from 'react'
import { BadgeDisplay as BadgeDisplayType, BadgeCategory, BadgeTier } from '@/types/badge'
import BadgeDisplay from './BadgeDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Trophy, Award, Star, Clock, Users, Zap } from 'lucide-react'

interface BadgeCollectionProps {
  badges: BadgeDisplayType[]
  showProgress?: boolean
  title?: string
}

const categoryIcons = {
  [BadgeCategory.CONTENT_CREATION]: <Award className="w-4 h-4" />,
  [BadgeCategory.ENGAGEMENT]: <Star className="w-4 h-4" />,
  [BadgeCategory.SOCIAL]: <Users className="w-4 h-4" />,
  [BadgeCategory.TIME_BASED]: <Clock className="w-4 h-4" />,
  [BadgeCategory.SPECIALTY]: <Zap className="w-4 h-4" />,
  [BadgeCategory.MILESTONE]: <Trophy className="w-4 h-4" />
}

const categoryNames = {
  [BadgeCategory.CONTENT_CREATION]: 'Content Creation',
  [BadgeCategory.ENGAGEMENT]: 'Engagement',
  [BadgeCategory.SOCIAL]: 'Social',
  [BadgeCategory.TIME_BASED]: 'Time-Based',
  [BadgeCategory.SPECIALTY]: 'Specialty',
  [BadgeCategory.MILESTONE]: 'Milestones'
}

export default function BadgeCollection({ 
  badges, 
  showProgress = true, 
  title = "Badge Collection" 
}: BadgeCollectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('tier')

  const stats = useMemo(() => {
    const earned = badges.filter(b => b.earned).length
    const total = badges.length
    const percentage = total > 0 ? (earned / total) * 100 : 0

    const tierCounts = badges.reduce((acc, badge) => {
      if (badge.earned) {
        acc[badge.tier] = (acc[badge.tier] || 0) + 1
      }
      return acc
    }, {} as Record<BadgeTier, number>)

    return { earned, total, percentage, tierCounts }
  }, [badges])

  const filteredAndSortedBadges = useMemo(() => {
    let filtered = badges

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(badge => badge.category === selectedCategory)
    }

    // Sort badges
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'tier':
          const tierOrder = [BadgeTier.LEGENDARY, BadgeTier.EPIC, BadgeTier.RARE, BadgeTier.UNCOMMON, BadgeTier.COMMON]
          return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
        case 'earned':
          if (a.earned && !b.earned) return -1
          if (!a.earned && b.earned) return 1
          return 0
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          if (!a.earnedAt && !b.earnedAt) return 0
          if (!a.earnedAt) return 1
          if (!b.earnedAt) return -1
          return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [badges, selectedCategory, sortBy])

  const badgesByCategory = useMemo(() => {
    return Object.values(BadgeCategory).reduce((acc, category) => {
      acc[category] = badges.filter(badge => badge.category === category)
      return acc
    }, {} as Record<BadgeCategory, BadgeDisplayType[]>)
  }, [badges])

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.earned} / {stats.total} badges
              </span>
            </div>
            <Progress value={stats.percentage} className="h-2" />
            
            {/* Tier breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              {Object.entries(stats.tierCounts).map(([tier, count]) => (
                <div key={tier} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {tier.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(categoryNames).map(([key, name]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tier">Tier</SelectItem>
            <SelectItem value="earned">Earned Status</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="date">Date Earned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Badge Display */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAndSortedBadges.map((badge) => (
              <div key={badge.id} className="flex justify-center">
                <BadgeDisplay
                  badge={badge}
                  size="lg"
                  showProgress={showProgress}
                  className="w-full justify-center"
                />
              </div>
            ))}
          </div>
          
          {filteredAndSortedBadges.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No badges found for the selected filters.
            </div>
          )}
        </TabsContent>

        <TabsContent value="category" className="space-y-6">
          {Object.entries(badgesByCategory).map(([category, categoryBadges]) => {
            if (categoryBadges.length === 0) return null
            
            const earnedCount = categoryBadges.filter(b => b.earned).length
            
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {categoryIcons[category as BadgeCategory]}
                    {categoryNames[category as BadgeCategory]}
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      ({earnedCount}/{categoryBadges.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoryBadges.map((badge) => (
                      <div key={badge.id} className="flex justify-center">
                        <BadgeDisplay
                          badge={badge}
                          size="md"
                          showProgress={showProgress}
                          className="w-full justify-center"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
