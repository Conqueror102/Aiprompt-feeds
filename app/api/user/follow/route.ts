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

    if (currentUserId === targetUserId) {
      return NextResponse.json({ message: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if already following
    const currentUser = await User.findById(currentUserId)
    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const isFollowing = currentUser.following?.includes(targetUserId)
    if (isFollowing) {
      return NextResponse.json({ message: 'Already following this user' }, { status: 400 })
    }

    // Add to following list
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { following: targetUserId },
    })

    // Add to target user's followers list
    await User.findByIdAndUpdate(targetUserId, {
      $addToSet: { followers: currentUserId },
    })

    // Trigger badge checks for both users (async, non-blocking)
    Promise.all([
      BadgeService.checkUserBadges(currentUserId),
      BadgeService.checkUserBadges(targetUserId)
    ]).catch(() => { })

    return NextResponse.json({ message: 'Successfully followed user' })
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
