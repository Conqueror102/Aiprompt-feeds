/**
 * LeaderboardView Component
 * 
 * Main leaderboard container with filters, podium, and list
 */

'use client'

import { useEffect } from 'react'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { useAuth } from '@/hooks/use-auth'
import { LeaderboardType, LeaderboardPeriod } from '@/types/leaderboard'
import { LeaderboardPodium } from './LeaderboardPodium'
import { LeaderboardEntry } from './LeaderboardEntry'
import { LeaderboardFilters } from './LeaderboardFilters'
import { UserRankCard } from './UserRankCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, RefreshCw, ChevronDown } from 'lucide-react'

interface LeaderboardViewProps {
  initialType?: LeaderboardType
  initialPeriod?: LeaderboardPeriod
}

export function LeaderboardView({
  initialType = LeaderboardType.OVERALL,
  initialPeriod = LeaderboardPeriod.ALL_TIME,
}: LeaderboardViewProps) {
  const { user } = useAuth()
  const {
    leaderboard,
    loading,
    error,
    metadata,
    currentUserRank,
    filters,
    setType,
    setPeriod,
    setCategory,
    setTier,
    setSearchQuery,
    fetchUserRank,
    loadMore,
    refresh,
    hasMore,
  } = useLeaderboard({
    type: initialType,
    period: initialPeriod,
    autoFetch: true,
  })

  // Fetch current user's rank
  useEffect(() => {
    if (user?._id) {
      fetchUserRank(user._id)
    }
  }, [user, filters.type, filters.period, fetchUserRank])

  // Split top 3 and rest
  const topThree = leaderboard.slice(0, 3)
  const restOfLeaderboard = leaderboard.slice(3)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderboardFilters
            currentType={filters.type || LeaderboardType.OVERALL}
            currentPeriod={filters.period || LeaderboardPeriod.ALL_TIME}
            currentCategory={filters.category}
            currentTier={filters.tier}
            onTypeChange={setType}
            onPeriodChange={setPeriod}
            onCategoryChange={setCategory}
            onTierChange={setTier}
            onSearchChange={setSearchQuery}
          />
        </CardContent>
      </Card>

      {/* Current User Rank */}
      {currentUserRank && currentUserRank.rank > 0 && (
        <UserRankCard rankInfo={currentUserRank} />
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && leaderboard.length === 0 && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {/* Leaderboard Content */}
      {!loading && leaderboard.length === 0 && !error && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No leaderboard data available</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}

      {leaderboard.length > 0 && (
        <>
          {/* Podium - Top 3 */}
          {topThree.length > 0 && (
            <div className="py-8">
              <LeaderboardPodium entries={topThree} />
            </div>
          )}

          {/* Rest of Leaderboard */}
          {restOfLeaderboard.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Leaderboard
                  {metadata && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({metadata.totalUsers} users)
                    </span>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  disabled={loading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {restOfLeaderboard.map((entry) => (
                  <LeaderboardEntry
                    key={entry.userId}
                    entry={entry}
                    showBadges
                  />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="pt-4 text-center">
                    <Button
                      onClick={loadMore}
                      disabled={loading}
                      variant="outline"
                      className="w-full md:w-auto"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Load More
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Metadata */}
                {metadata && (
                  <div className="pt-4 text-center text-xs text-muted-foreground">
                    Showing {leaderboard.length} of {metadata.totalUsers} users
                    {metadata.lastUpdated && (
                      <span className="ml-2">
                        • Updated {new Date(metadata.lastUpdated).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
