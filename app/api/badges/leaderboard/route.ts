/**
 * Badge Leaderboard API Route
 * 
 * GET /api/badges/leaderboard - Get badge leaderboard with advanced filtering
 * 
 * Query Parameters:
 * - type: LeaderboardType (overall, weekly, monthly, yearly, category, tier)
 * - period: LeaderboardPeriod (all_time, weekly, monthly, yearly)
 * - category: BadgeCategory (optional, for category leaderboard)
 * - tier: BadgeTier (optional, for tier leaderboard)
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0, for pagination)
 * - search: string (optional, search by username)
 */

import { NextRequest, NextResponse } from 'next/server'
import { LeaderboardService } from '@/services/leaderboard-service'
import {
  LeaderboardType,
  LeaderboardPeriod,
  LeaderboardFilters,
} from '@/types/leaderboard'
import { BadgeCategory, BadgeTier } from '@/types/badge'
import dbConnect from '@/lib/mongodb'

/**
 * GET /api/badges/leaderboard
 * Get badge leaderboard with advanced filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect()

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    let type = (searchParams.get('type') as LeaderboardType) || LeaderboardType.OVERALL
    const period = (searchParams.get('period') as LeaderboardPeriod) || LeaderboardPeriod.ALL_TIME
    const category = searchParams.get('category') as BadgeCategory | undefined
    const tier = searchParams.get('tier') as BadgeTier | undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const searchQuery = searchParams.get('search') || undefined

    // Validate type-specific requirements and fallback to OVERALL if invalid
    if (type === LeaderboardType.CATEGORY && !category) {
      console.warn('Category leaderboard requested without category parameter, falling back to overall')
      type = LeaderboardType.OVERALL
    }
    if (type === LeaderboardType.TIER && !tier) {
      console.warn('Tier leaderboard requested without tier parameter, falling back to overall')
      type = LeaderboardType.OVERALL
    }

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    if (offset < 0) {
      return NextResponse.json(
        { success: false, error: 'Offset must be non-negative' },
        { status: 400 }
      )
    }

    // Build filters
    const filters: Partial<LeaderboardFilters> = {
      type,
      period,
      category,
      tier,
      limit,
      offset,
      searchQuery,
    }

    // Get leaderboard
    const response = await LeaderboardService.getLeaderboard(filters)

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error('Error fetching badge leaderboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badge leaderboard' },
      { status: 500 }
    )
  }
}
