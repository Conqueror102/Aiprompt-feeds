/**
 * Comment Like API Route
 * 
 * POST /api/comments/[id]/like - Toggle like on a comment
 */

import { NextRequest, NextResponse } from 'next/server'
import { CommentService } from '@/services/comment-service'
import { verifyToken } from '@/lib/auth'
import { BadgeService } from '@/services/badge-service'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * POST /api/comments/[id]/like
 * Toggle like/unlike on a comment
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id: commentId } = params

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    const result = await CommentService.toggleCommentLike(commentId, decoded.userId)

    // Trigger badge check asynchronously (non-blocking)
    BadgeService.checkUserBadges(decoded.userId).catch(() => { })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error toggling comment like:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to toggle comment like' },
      { status: 500 }
    )
  }
}
