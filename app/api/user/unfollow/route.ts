import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import { verifyToken } from '@/lib/auth'
import { BadgeService } from '@/services/badge-service'

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }
    const currentUserId = decoded.userId

    const { userId: targetUserId } = await req.json()

    if (!targetUserId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 })
    }

    // Remove from following list
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    })

    // Remove from target user's followers list
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    })

    // Trigger badge checks for both users (async, non-blocking)
    Promise.all([
      BadgeService.checkUserBadges(currentUserId),
      BadgeService.checkUserBadges(targetUserId)
    ]).catch(() => { })

    return NextResponse.json({ message: 'Successfully unfollowed user' })
  } catch (error) {
    console.error('Unfollow error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
