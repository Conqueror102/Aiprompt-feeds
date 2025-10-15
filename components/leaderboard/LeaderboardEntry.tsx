/**
 * LeaderboardEntry Component
 * 
 * Displays a single user entry in the leaderboard
 */

'use client'

import Link from 'next/link'
import { LeaderboardEntry as LeaderboardEntryType } from '@/types/leaderboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardEntryProps {
  entry: LeaderboardEntryType
  showBadges?: boolean
  compact?: boolean
}

export function LeaderboardEntry({
  entry,
  showBadges = true,
  compact = false,
}: LeaderboardEntryProps) {
  const { rank, userName, avatar, totalScore, badgeCount, badgeBreakdown, scoreChange } = entry

  // Determine rank styling
  const getRankStyle = () => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/50'
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg shadow-gray-400/50'
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/50'
    return 'bg-muted text-muted-foreground'
  }

  const getRankIcon = () => {
    if (rank <= 3) {
      return <Trophy className="h-4 w-4" />
    }
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent',
        rank <= 3 && 'border-primary/50 bg-primary/5',
        compact && 'p-3'
      )}
    >
      {/* Rank */}
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold',
          getRankStyle(),
          compact && 'h-10 w-10'
        )}
      >
        {getRankIcon() || rank}
      </div>

      {/* User Info */}
      <Link
        href={`/user/${entry.userId}`}
        className="flex flex-1 items-center gap-3 min-w-0"
      >
        <Avatar className={cn('h-10 w-10', compact && 'h-8 w-8')}>
          <AvatarImage src={avatar} alt={userName} />
          <AvatarFallback>{userName[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold truncate', compact && 'text-sm')}>
            {userName}
          </p>
          <p className="text-sm text-muted-foreground">
            {badgeCount} {badgeCount === 1 ? 'badge' : 'badges'}
          </p>
        </div>
      </Link>

      {/* Badge Breakdown */}
      {showBadges && !compact && (
        <div className="hidden sm:flex gap-2">
          {badgeBreakdown.legendary > 0 && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
              🏆 {badgeBreakdown.legendary}
            </Badge>
          )}
          {badgeBreakdown.epic > 0 && (
            <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30">
              💎 {badgeBreakdown.epic}
            </Badge>
          )}
          {badgeBreakdown.rare > 0 && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">
              💠 {badgeBreakdown.rare}
            </Badge>
          )}
        </div>
      )}

      {/* Score */}
      <div className="text-right">
        <p className={cn('font-bold text-primary', compact && 'text-sm')}>
          {totalScore.toLocaleString()}
        </p>
        {scoreChange !== undefined && scoreChange !== 0 && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {scoreChange > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+{scoreChange}</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-red-500">{scoreChange}</span>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
