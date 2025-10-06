import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import Prompt from '@/lib/models/Prompt'
import { verifyToken } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const userId = params.id

    // Get current user ID if authenticated
    let currentUserId: string | null = null
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        currentUserId = decoded.userId
      }
    }

    // Find the user
    const user = await User.findById(userId).select('-password')
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Count user's prompts
    const promptsCount = await Prompt.countDocuments({ createdBy: userId })

    // Count likes on user's prompts
    const userPrompts = await Prompt.find({ createdBy: userId }).select('likes')
    const likesCount = userPrompts.reduce((sum, prompt) => sum + (prompt.likes || 0), 0)

    // Check if current user is following this user
    let isFollowing = false
    if (currentUserId) {
      const currentUser = await User.findById(currentUserId)
      isFollowing = currentUser?.following?.includes(userId) || false
    }

    const profile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      createdAt: user.createdAt,
      promptsCount,
      likesCount,
      isFollowing,
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
