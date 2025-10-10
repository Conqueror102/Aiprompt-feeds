/**
 * Badge Leaderboard API Route
 * 
 * GET /api/badges/leaderboard - Get top badge collectors
 */

import { NextRequest, NextResponse } from 'next/server'
import { BadgeService } from '@/services/badge-service'

/**
 * GET /api/badges/leaderboard
 * Get badge leaderboard with top collectors
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    if (limit > 50) {
      return NextResponse.json(
        { success: false, error: 'Limit cannot exceed 50' },
        { status: 400 }
      )
    }

    const leaderboard = await BadgeService.getBadgeLeaderboard(limit)

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        total: leaderboard.length
      }
    })
  } catch (error) {
    console.error('Error fetching badge leaderboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badge leaderboard' },
      { status: 500 }
    )
  }
}
