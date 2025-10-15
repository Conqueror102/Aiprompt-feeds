import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"

/**
 * GET /api/prompts/slug/[slug]
 * Fetch a prompt by its SEO-friendly slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect()
    const { slug } = await params

    const prompt = await Prompt.findOne({ slug })
      .populate("createdBy", "name _id")
      .lean() as any

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      )
    }

    // Don't return private prompts unless user is the owner
    // (You can add auth check here if needed)
    if (prompt.private) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { status: 404 }
      )
    }

    // Increment view count for analytics
    await Prompt.updateOne(
      { _id: prompt._id },
      { 
        $inc: { "analytics.views": 1 },
        $set: { "analytics.lastViewed": new Date() }
      }
    )

    return NextResponse.json(prompt)
  } catch (error) {
    console.error("Error fetching prompt by slug:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
