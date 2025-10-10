/**
 * Individual Comment API Routes
 * 
 * GET /api/comments/[id] - Get a specific comment
 * PUT /api/comments/[id] - Update a comment
 * DELETE /api/comments/[id] - Delete a comment
 */

import { NextRequest, NextResponse } from 'next/server'
import { CommentService } from '@/services/comment-service'
import { verifyToken } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/comments/[id]
 * Get a specific comment with its thread
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: commentId } = params

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'Comment ID is required' },
        { status: 400 }
      )
    }

    // For now, we'll get replies separately
    // In the future, we can implement the full thread view
    const { searchParams } = new URL(request.url)
    const includeReplies = searchParams.get('includeReplies') === 'true'
    
    if (includeReplies) {
      const replies = await CommentService.getCommentReplies(commentId)
      return NextResponse.json({
        success: true,
        data: { replies }
      })
    }

    // For individual comment, we'd need to implement getCommentById
    return NextResponse.json(
      { success: false, error: 'Feature not implemented yet' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Error fetching comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comment' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/comments/[id]
 * Update a comment (only by author)
 */
export async function PUT(
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
    const body = await request.json()
    const { content } = body

    // Validation
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      )
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Comment too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    const comment = await CommentService.updateComment(
      commentId,
      { content: content.trim() },
      decoded.userId
    )

    return NextResponse.json({
      success: true,
      data: { comment }
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/comments/[id]
 * Delete a comment (soft delete)
 */
export async function DELETE(
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

    await CommentService.deleteComment(commentId, decoded.userId)

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
