/**
 * Badge API Routes
 * 
 * GET /api/badges - Get all badge definitions
 * POST /api/badges/check - Check and award badges for a user
 */

import { NextRequest, NextResponse } from 'next/server'
import { BadgeService } from '@/services/badge-service'
import { ALL_BADGES } from '@/lib/badges/badge-definitions'
import { verifyToken } from '@/lib/auth'

/**
 * GET /api/badges
 * Returns all available badge definitions
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        badges: ALL_BADGES,
        total: ALL_BADGES.length
      }
    })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/badges/check
 * Check and award badges for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const newBadges = await BadgeService.checkUserBadges(decoded.userId)

    return NextResponse.json({
      success: true,
      data: {
        newBadges,
        count: newBadges.length
      }
    })
  } catch (error) {
    console.error('Error checking badges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check badges' },
      { status: 500 }
    )
  }
}
