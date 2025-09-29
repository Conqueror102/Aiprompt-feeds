import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"
import User from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"

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
  const filter: any = { isApproved: true }
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
    // We want prompts that are either public (private: false) OR private but createdBy the user
    if (userId) {
      filter.$or = [{ private: false }, { createdBy: userId }]
    } else {
      filter.private = false
    }

    const prompts = await Prompt.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Debug: Log the first prompt to see what fields are available
    if (prompts.length > 0) {
      console.log("First prompt structure:", JSON.stringify(prompts[0], null, 2))
    }

    const total = await Prompt.countDocuments(filter)

    return NextResponse.json({
      prompts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Fetch prompts error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
