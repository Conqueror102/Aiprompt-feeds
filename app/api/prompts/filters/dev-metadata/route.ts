import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Prompt from "@/lib/models/Prompt"

export async function GET() {
  try {
    await dbConnect()

    // Aggregate all unique technologies and tools from Development category prompts
    const devPrompts = await Prompt.find({ category: "Development" }).select("technologies tools")

    const technologiesSet = new Set<string>()
    const toolsSet = new Set<string>()

    devPrompts.forEach((prompt) => {
      if (prompt.technologies && Array.isArray(prompt.technologies)) {
        prompt.technologies.forEach((tech: string) => technologiesSet.add(tech))
      }
      if (prompt.tools && Array.isArray(prompt.tools)) {
        prompt.tools.forEach((tool: string) => toolsSet.add(tool))
      }
    })

    const technologies = Array.from(technologiesSet).sort()
    const tools = Array.from(toolsSet).sort()

    return NextResponse.json({ technologies, tools })
  } catch (error) {
    console.error("Error fetching dev metadata:", error)
    return NextResponse.json({ technologies: [], tools: [] }, { status: 500 })
  }
}
