import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id: userId } = await params

    const user = await User.findById(userId)
      .populate('following', 'name email avatar bio')
      .select('following')

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const users = user.following || []

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get following error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
