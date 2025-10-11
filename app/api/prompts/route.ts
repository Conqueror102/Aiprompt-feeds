import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"
import User from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"
import { getHighestTier } from "@/lib/badges/get-highest-tier"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const agent = searchParams.get("agent")

    const skip = (page - 1) * limit

  // Build base filter
  // Include legacy docs where isApproved/private may be missing
  const filter: any = {
    $and: [
      { $or: [{ isApproved: true }, { isApproved: { $exists: false } }] },
    ],
  }
    if (category && category !== "all") {
      filter.category = category
    }
    if (agent && agent !== "all") {
      filter.aiAgents = { $in: [agent] }
    }

    // Check for auth token to include private prompts for the owner
    const authHeader = request.headers.get("authorization")
    let userId: string | null = null
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = verifyToken(token)
      if (decoded) {
        userId = decoded.userId
      }
    }

    // Adjust filter to exclude private prompts unless owned by the requesting user
    // Public prompts: private is false OR missing
    if (userId) {
      filter.$and.push({
        $or: [
          { private: false },
          { private: { $exists: false } },
          { createdBy: new mongoose.Types.ObjectId(userId) },
        ],
      })
    } else {
      filter.$and.push({
        $or: [
          { private: false },
          { private: { $exists: false } },
        ],
      })
    }

    const prompts = await Prompt.find(filter)
      .select('title content description aiAgents category createdBy likes saves createdAt rating private tools technologies commentCount')
      .populate("createdBy", "name email badges")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() // Convert to plain JavaScript objects for better performance

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

    const total = await Prompt.countDocuments(filter)

    const response = NextResponse.json({
      prompts: promptsWithTiers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
    
    // Prevent caching to ensure fresh badge data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    
    return response
  } catch (error) {
    console.error("Fetch prompts error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
