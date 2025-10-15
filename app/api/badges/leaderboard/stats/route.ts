/**
 * Leaderboard Statistics API Route
 * 
 * GET /api/badges/leaderboard/stats - Get global leaderboard statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { LeaderboardService } from '@/services/leaderboard-service'
import dbConnect from '@/lib/mongodb'

/**
 * GET /api/badges/leaderboard/stats
 * Get overall leaderboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()

    const stats = await LeaderboardService.getLeaderboardStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard stats' },
      { status: 500 }
    )
  }
}
