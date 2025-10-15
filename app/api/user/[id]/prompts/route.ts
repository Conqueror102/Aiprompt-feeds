import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Prompt from '@/lib/models/Prompt'
import { getHighestTier } from '@/lib/badges/get-highest-tier'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id: userId } = await params

    // Find all prompts by this user (only public ones unless it's their own profile)
    const prompts = await Prompt.find({
      createdBy: userId,
      private: { $ne: true }, // Only show public prompts
    })
      .populate('createdBy', 'name email badges')
      .sort({ createdAt: -1 })
      .lean()

    // Add highest tier to each prompt's creator
    const promptsWithTiers = prompts.map((prompt: any) => {
      if (prompt.createdBy && prompt.createdBy.badges) {
        const highestTier = getHighestTier(prompt.createdBy.badges)
        prompt.createdBy = {
          _id: prompt.createdBy._id,
          name: prompt.createdBy.name,
          email: prompt.createdBy.email,
          highestTier
        }
      }
      return prompt
    })

    return NextResponse.json({ prompts: promptsWithTiers })
  } catch (error) {
    console.error('Get user prompts error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
