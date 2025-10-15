/**
 * LeaderboardPodium Component
 * 
 * Displays the top 3 users in a podium-style layout
 */

'use client'

import Link from 'next/link'
import { LeaderboardEntry } from '@/types/leaderboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[]
}

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  const [first, second, third] = entries

  if (!first) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No leaderboard data available
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-end justify-center gap-4 md:gap-8">
        {/* Second Place */}
        {second && (
          <PodiumCard
            entry={second}
            rank={2}
            height="h-48"
            color="from-gray-300/30 to-gray-500/30"
            iconColor="text-gray-500"
          />
        )}

        {/* First Place */}
        <PodiumCard
          entry={first}
          rank={1}
          height="h-64"
          color="from-yellow-400/30 to-yellow-600/30"
          iconColor="text-yellow-600"
          winner
        />

        {/* Third Place */}
        {third && (
          <PodiumCard
            entry={third}
            rank={3}
            height="h-40"
            color="from-orange-400/30 to-orange-600/30"
            iconColor="text-orange-600"
          />
        )}
      </div>
    </div>
  )
}

interface PodiumCardProps {
  entry: LeaderboardEntry
  rank: number
  height: string
  color: string
  iconColor: string
  winner?: boolean
}

function PodiumCard({
  entry,
  rank,
  height,
  color,
  iconColor,
  winner = false,
}: PodiumCardProps) {
  return (
    <Link
      href={`/user/${entry.userId}`}
      className="group flex flex-col items-center gap-3 relative"
    >
      {/* Crown for winner */}
      {winner && (
        <div className="absolute -top-8 animate-bounce">
          <Crown className="h-8 w-8 text-yellow-500 fill-yellow-500" />
        </div>
      )}

      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-20 w-20 border-4 border-background ring-4 ring-primary/20 transition-transform group-hover:scale-110">
          <AvatarImage src={entry.avatar} alt={entry.userName} />
          <AvatarFallback>{entry.userName[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        {/* Rank badge */}
        <div
          className={cn(
            'absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background font-bold',
            rank === 1 && 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-500/50',
            rank === 2 && 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg shadow-gray-400/50',
            rank === 3 && 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/50'
          )}
        >
          <Trophy className="h-4 w-4" />
        </div>
      </div>

      {/* User Info Card */}
      <div
        className={cn(
          'flex w-32 md:w-40 flex-col items-center justify-end rounded-t-xl border border-b-0 bg-gradient-to-b p-4 transition-transform group-hover:-translate-y-2',
          height,
          color
        )}
      >
        <div className="mt-auto text-center">
          <p className="font-bold truncate text-sm md:text-base">
            {entry.userName}
          </p>
          <p className={cn('text-2xl md:text-3xl font-bold mt-2', iconColor)}>
            {entry.totalScore.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {entry.badgeCount} badges
          </p>

          {/* Badge breakdown */}
          <div className="flex flex-wrap gap-1 justify-center mt-2">
            {entry.badgeBreakdown.legendary > 0 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                🏆 {entry.badgeBreakdown.legendary}
              </Badge>
            )}
            {entry.badgeBreakdown.epic > 0 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                💎 {entry.badgeBreakdown.epic}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Rank number below podium */}
      <div className="flex h-8 items-center justify-center text-2xl font-bold text-muted-foreground">
        #{rank}
      </div>
    </Link>
  )
}
