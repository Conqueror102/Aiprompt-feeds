import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Prompt from '@/lib/models/Prompt'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const userId = params.id

    // Find all prompts by this user (only public ones unless it's their own profile)
    const prompts = await Prompt.find({
      createdBy: userId,
      private: { $ne: true }, // Only show public prompts
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('Get user prompts error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
