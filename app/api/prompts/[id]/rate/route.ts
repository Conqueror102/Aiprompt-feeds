import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"
import Rating from "@/lib/models/Rating"
import User from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  
  try {
    const decoded = verifyToken(token)
    if (!decoded) return null
    
    const user = await User.findById(decoded.userId)
    return user
  } catch (error) {
    return null
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect()
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const promptId = params.id
  const { value } = await req.json()

  if (!value || value < 1 || value > 5) {
    return NextResponse.json({ error: "Invalid rating value" }, { status: 400 })
  }

  try {
    // Save or update the user's rating
    await Rating.findOneAndUpdate(
      { prompt: promptId, user: user._id },
      { value },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    // Get all ratings for this prompt
    const ratings = await Rating.find({ prompt: promptId })
    const avg = ratings.length ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length : null

    // Update the prompt with the new average rating
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      promptId, 
      { rating: avg }, 
      { new: true, runValidators: true }
    ).populate("createdBy", "name email")

    if (!updatedPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      average: avg, 
      count: ratings.length,
      prompt: updatedPrompt
    })
  } catch (error) {
    console.error("Rating error:", error)
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 })
  }
}

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect()
  const user = await getUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const promptId = params.id
  const rating = await Rating.findOne({ prompt: promptId, user: user._id })
  return NextResponse.json({ value: rating ? rating.value : null })
} 