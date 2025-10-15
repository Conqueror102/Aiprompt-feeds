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
      .populate('followers', 'name email avatar bio')
      .select('followers')

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const users = user.followers || []

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get followers error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
