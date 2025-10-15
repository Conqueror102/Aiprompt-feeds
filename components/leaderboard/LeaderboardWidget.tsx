/**
 * LeaderboardWidget Component
 * 
 * Compact leaderboard for explore page showing top 5 users
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LeaderboardEntry } from '@/types/leaderboard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LeaderboardWidget() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await fetch('/api/badges/leaderboard?type=overall&period=all_time&limit=5')
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard')
        }

        const result = await response.json()

        if (result.success) {
          setLeaderboard(result.data.leaderboard)
        } else {
          throw new Error(result.error || 'Failed to load leaderboard')
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
        setError('Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }

    fetchTopUsers()
  }, [])

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
    return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
  }

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Contributors
          </CardTitle>
          <Link href="/leaderboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {error}
          </div>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No leaderboard data available
          </div>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <Link
                key={entry.userId}
                href={`/user/${entry.userId}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors group"
              >
                {/* Rank Badge */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    getRankStyle(entry.rank)
                  )}
                >
                  {entry.rank <= 3 ? <Trophy className="h-4 w-4" /> : entry.rank}
                </div>

                {/* User Avatar & Info */}
                <Avatar className="h-9 w-9 border-2 border-green-200 dark:border-green-800">
                  <AvatarImage src={entry.avatar} alt={entry.userName} />
                  <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    {entry.userName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {entry.userName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{entry.badgeCount} badges</span>
                    {entry.badgeBreakdown.legendary > 0 && (
                      <Badge variant="outline" className="px-1 py-0 h-4 text-[10px] bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
                        🏆 {entry.badgeBreakdown.legendary}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {entry.totalScore.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">points</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
