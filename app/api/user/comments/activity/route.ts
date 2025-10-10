import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { CommentService } from '@/services/comment-service'

export async function GET(request: NextRequest) {
    try {
        await dbConnect()

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId is required' },
                { status: 400 }
            )
        }

        const data = await CommentService.getUserCommentActivity(userId)

        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Error fetching user comment activity:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user comment activity' },
            { status: 500 }
        )
    }
}


