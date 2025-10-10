/**
 * Comment Replies API Route
 * 
 * GET /api/comments/[id]/replies - Get replies for a comment
 */

import { NextRequest, NextResponse } from 'next/server'
import { CommentService } from '@/services/comment-service'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/comments/[id]/replies
 * Get replies for a specific comment with pagination
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: commentId } = params
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    if (limit > 50) {
      return NextResponse.json(
        { success: false, error: 'Limit cannot exceed 50' },
        { status: 400 }
      )
    }

    const replies = await CommentService.getCommentReplies(commentId, limit, offset)

    return NextResponse.json({
      success: true,
      data: {
        replies,
        total: replies.length,
        hasMore: replies.length === limit // Simple check, could be improved
      }
    })
  } catch (error) {
    console.error('Error fetching comment replies:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch replies' },
      { status: 500 }
    )
  }
}
