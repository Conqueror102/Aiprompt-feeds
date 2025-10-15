/**
 * User Rank API Route
 * 
 * GET /api/badges/leaderboard/user/[id] - Get user's rank and position
 */

import { NextRequest, NextResponse } from 'next/server'
import { LeaderboardService } from '@/services/leaderboard-service'
import { LeaderboardType, LeaderboardPeriod } from '@/types/leaderboard'
import dbConnect from '@/lib/mongodb'

/**
 * GET /api/badges/leaderboard/user/[id]
 * Get user's rank and nearby users
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    await dbConnect()

    const { id } = await params
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const type = (searchParams.get('type') as LeaderboardType) || LeaderboardType.OVERALL
    const period = (searchParams.get('period') as LeaderboardPeriod) || LeaderboardPeriod.ALL_TIME

    // Get user rank
    const userRank = await LeaderboardService.getUserRank(id, type, period)

    if (!userRank) {
      return NextResponse.json(
        { success: false, error: 'User not found or has no badges' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: userRank,
    })
  } catch (error) {
    console.error('Error fetching user rank:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user rank' },
      { status: 500 }
    )
  }
}
