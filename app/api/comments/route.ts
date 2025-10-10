/**
 * Comments API Routes
 * 
 * GET /api/comments - Get comments with filters
 * POST /api/comments - Create a new comment
 */

import { NextRequest, NextResponse } from 'next/server'
import { CommentService } from '@/services/comment-service'
import { verifyToken } from '@/lib/auth'
import { BadgeService } from '@/services/badge-service'

/**
 * GET /api/comments
 * Get comments with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      promptId: searchParams.get('promptId') || undefined,
      authorId: searchParams.get('authorId') || undefined,
      sortBy: (searchParams.get('sortBy') as 'newest' | 'oldest' | 'mostLiked') || 'newest',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    if (!filters.promptId) {
      return NextResponse.json(
        { success: false, error: 'promptId is required' },
        { status: 400 }
      )
    }

    const result = await CommentService.getPromptComments(filters.promptId, filters)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/comments
 * Create a new comment or reply
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

    const body = await request.json()
    const { content, promptId, parentId } = body

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

    if (!promptId) {
      return NextResponse.json(
        { success: false, error: 'promptId is required' },
        { status: 400 }
      )
    }

    const comment = await CommentService.createComment(
      { content: content.trim(), promptId, parentId },
      decoded.userId
    )

    // Trigger badge check asynchronously (non-blocking)
    BadgeService.checkUserBadges(decoded.userId).catch(() => { })

    return NextResponse.json({
      success: true,
      data: { comment }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
