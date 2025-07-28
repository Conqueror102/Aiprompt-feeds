import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params

    const prompt = await Prompt.findById(id)
      .populate("createdBy", "name email")

    if (!prompt) {
      return NextResponse.json({ message: "Prompt not found" }, { status: 404 })
    }

    return NextResponse.json(prompt)
  } catch (error) {
    console.error("Fetch prompt error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await params
    
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Get the prompt to check ownership
    const existingPrompt = await Prompt.findById(id)
    if (!existingPrompt) {
      return NextResponse.json({ message: "Prompt not found" }, { status: 404 })
    }

    // Check if user is the owner
    if (existingPrompt.createdBy.toString() !== decoded.userId) {
      return NextResponse.json({ message: "You can only edit your own prompts" }, { status: 403 })
    }

    const { title, content, description, category, aiAgents, technologies, tools } = await request.json()

    const prompt = await Prompt.findByIdAndUpdate(
      id,
      { title, content, description, category, aiAgents, technologies, tools },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email")

    return NextResponse.json(prompt)
  } catch (error) {
    console.error("Update prompt error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 