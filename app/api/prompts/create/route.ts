import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"
import { BadgeService } from "@/services/badge-service"
import User from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"
import { generateSlug } from "@/lib/utils"
import { triggerBadgesAfterPromptCreate } from "@/lib/badges/badge-triggers"

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

    // Generate SEO-friendly slug
    let slug = generateSlug(title)
    
    // Check if slug already exists and make it unique
    const existingPrompt = await Prompt.findOne({ slug })
    if (existingPrompt) {
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      slug = `${slug}-${randomSuffix}`
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
      slug, // Add SEO-friendly slug
    })

    const populatedPrompt = await Prompt.findById(prompt._id).populate("createdBy", "name email")

    // Trigger badge check and get newly earned badges
    const newBadges = await triggerBadgesAfterPromptCreate(decoded.userId, {
      category,
      aiAgents,
    }).catch((error) => {
      console.error('Badge trigger error:', error)
      return []
    })

    return NextResponse.json({
      message: "Prompt created successfully",
      prompt: populatedPrompt,
      newBadges: newBadges || [], // Include earned badges in response
    })
  } catch (error) {
    console.error("Create prompt error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
