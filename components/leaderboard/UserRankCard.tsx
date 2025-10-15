/**
 * UserRankCard Component
 * 
 * Displays the current user's rank and position in the leaderboard
 */

'use client'

import { UserRankInfo } from '@/types/leaderboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserRankCardProps {
  rankInfo: UserRankInfo
  className?: string
}

export function UserRankCard({ rankInfo, className }: UserRankCardProps) {
  const { rank, score, percentile, badgeCount, totalUsers } = rankInfo

  const getPercentileColor = () => {
    if (percentile >= 90) return 'text-yellow-500'
    if (percentile >= 75) return 'text-purple-500'
    if (percentile >= 50) return 'text-blue-500'
    return 'text-muted-foreground'
  }

  const getRankDescription = () => {
    if (rank === 0) return 'Unranked'
    if (rank === 1) return '🏆 Champion'
    if (rank <= 3) return '🥇 Top 3'
    if (rank <= 10) return '⭐ Top 10'
    if (rank <= 50) return '🌟 Top 50'
    if (rank <= 100) return '✨ Top 100'
    return '👤 Ranked'
  }

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Your Rank
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rank and Description */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Position</p>
            <p className="text-3xl font-bold text-primary">
              {rank === 0 ? '—' : `#${rank}`}
            </p>
            <Badge variant="outline" className="mt-2">
              {getRankDescription()}
            </Badge>
          </div>

          {/* Score */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Score</p>
            <p className="text-2xl font-bold">{score.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {badgeCount} {badgeCount === 1 ? 'badge' : 'badges'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          {/* Percentile */}
          <div className="flex items-center gap-2">
            <TrendingUp className={cn('h-5 w-5', getPercentileColor())} />
            <div>
              <p className="text-sm font-medium">Top {(100 - percentile).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Percentile</p>
            </div>
          </div>

          {/* Total Users */}
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{totalUsers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {percentile > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Your Position</span>
              <span>{percentile.toFixed(1)}th percentile</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  percentile >= 90 && 'bg-yellow-500',
                  percentile >= 75 && percentile < 90 && 'bg-purple-500',
                  percentile >= 50 && percentile < 75 && 'bg-blue-500',
                  percentile < 50 && 'bg-muted-foreground'
                )}
                style={{ width: `${percentile}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
