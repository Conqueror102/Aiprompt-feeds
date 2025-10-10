import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import Prompt from "@/lib/models/Prompt"
import { BadgeService } from "@/services/badge-service"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
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

    const { promptId } = await request.json()

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const prompt = await Prompt.findById(promptId)
    if (!prompt) {
      return NextResponse.json({ message: "Prompt not found" }, { status: 404 })
    }

    const isSaved = user.savedPrompts.includes(promptId)

    if (isSaved) {
      // Remove from saved
      user.savedPrompts = user.savedPrompts.filter((id) => id.toString() !== promptId)
      prompt.saves = Math.max(0, prompt.saves - 1)
    } else {
      // Add to saved
      user.savedPrompts.push(promptId)
      prompt.saves += 1
    }

    await user.save()
    await prompt.save()

    // Trigger badge check asynchronously (non-blocking)
    BadgeService.checkUserBadges(decoded.userId).catch(() => { })

    return NextResponse.json({
      message: isSaved ? "Prompt removed from saved" : "Prompt saved",
      saved: !isSaved,
    })
  } catch (error) {
    console.error("Save prompt error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
