import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
import Prompt from "@/lib/models/Prompt"
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

    const isLiked = user.likedPrompts.includes(promptId)

    if (isLiked) {
      // Remove like
      user.likedPrompts = user.likedPrompts.filter((id) => id.toString() !== promptId)
      prompt.likes = Math.max(0, prompt.likes - 1)
    } else {
      // Add like
      user.likedPrompts.push(promptId)
      prompt.likes += 1
    }

    await user.save()
    await prompt.save()

    return NextResponse.json({
      message: isLiked ? "Prompt unliked" : "Prompt liked",
      liked: !isLiked,
    })
  } catch (error) {
    console.error("Like prompt error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
