import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/lib/models/User"
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

    const user = await User.findById(decoded.userId).populate({
      path: "likedPrompts",
      populate: {
        path: "createdBy",
        select: "name email",
      },
      options: { sort: { createdAt: -1 } },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      prompts: user.likedPrompts,
    })
  } catch (error) {
    console.error("Fetch liked prompts error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
} 