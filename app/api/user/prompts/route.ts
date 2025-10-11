import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"
import { verifyToken } from "@/lib/auth"
import { getHighestTier } from "@/lib/badges/get-highest-tier"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const prompts = await Prompt.find({ createdBy: decoded.userId })
      .populate("createdBy", "name email badges")
      .sort({ createdAt: -1 })

    // Add highest tier to each prompt's creator
    const promptsWithTiers = prompts.map((prompt: any) => {
      const promptObj = prompt.toObject()
      if (promptObj.createdBy && promptObj.createdBy.badges) {
        const highestTier = getHighestTier(promptObj.createdBy.badges)
        promptObj.createdBy = {
          _id: promptObj.createdBy._id,
          name: promptObj.createdBy.name,
          email: promptObj.createdBy.email,
          highestTier
        }
      }
      return promptObj
    })

    return NextResponse.json({
      prompts: promptsWithTiers,
    })
  } catch (error) {
    console.error("Fetch user prompts error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
