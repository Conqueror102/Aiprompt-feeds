/**
 * User Badge API Routes
 * 
 * GET /api/badges/user/[id] - Get badges for a specific user
 */

import { NextRequest, NextResponse } from 'next/server'
import { BadgeService } from '@/services/badge-service'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/badges/user/[id]
 * Get all badges for a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: userId } = params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userBadges = await BadgeService.getUserBadges(userId)

    return NextResponse.json({
      success: true,
      data: {
        badges: userBadges,
        total: userBadges.length
      }
    })
  } catch (error) {
    console.error('Error fetching user badges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user badges' },
      { status: 500 }
    )
  }
}
