import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"
import { AI_AGENTS } from "@/lib/constants"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const stats: { [key: string]: number } = {}

    // Get count for each AI agent
    for (const agent of AI_AGENTS) {
      const count = await Prompt.countDocuments({
        aiAgents: { $in: [agent] },
        isApproved: true,
      })
      stats[agent] = count
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Fetch agent stats error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
