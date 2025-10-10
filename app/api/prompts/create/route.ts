import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"
import { BadgeService } from "@/services/badge-service"
import User from "@/lib/models/User"
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

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const { title, content, description, category, aiAgents, technologies, tools, private: isPrivate } = await request.json()

    if (!title || !content || !category || !aiAgents || aiAgents.length === 0) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const prompt = await Prompt.create({
      title,
      content,
      description,
      category,
      aiAgents,
      technologies: technologies || [],
      tools: tools || [],
      private: !!isPrivate,
      createdBy: user._id,
    })

    const populatedPrompt = await Prompt.findById(prompt._id).populate("createdBy", "name email")

    // Trigger badge check asynchronously (non-blocking)
    BadgeService.checkUserBadges(decoded.userId).catch(() => { })

    return NextResponse.json({
      message: "Prompt created successfully",
      prompt: populatedPrompt,
    })
  } catch (error) {
    console.error("Create prompt error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
