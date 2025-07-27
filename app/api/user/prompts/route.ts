import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"
import { verifyToken } from "@/lib/auth"

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
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    return NextResponse.json({
      prompts,
    })
  } catch (error) {
    console.error("Fetch user prompts error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
