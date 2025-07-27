import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const agent = searchParams.get("agent")

    const skip = (page - 1) * limit

    // Build filter
    const filter: any = { isApproved: true }
    if (category && category !== "all") {
      filter.category = category
    }
    if (agent && agent !== "all") {
      filter.aiAgents = { $in: [agent] }
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
