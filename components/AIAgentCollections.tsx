"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AI_AGENTS } from "@/lib/constants"

interface AIAgentCollectionsProps {
  onAgentSelect: (agent: string) => void
  selectedAgent?: string
}

interface AgentStats {
  [key: string]: number
}

export default function AIAgentCollections({ onAgentSelect, selectedAgent }: AIAgentCollectionsProps) {
  const [agentStats, setAgentStats] = useState<AgentStats>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgentStats()
  }, [])

  const fetchAgentStats = async () => {
    try {
      const response = await fetch("/api/agents/stats")
      if (response.ok) {
        const data = await response.json()
        setAgentStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch agent stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getAgentLogo = (agent: string) => {
    // Return appropriate emoji/icon for each agent
    const logos: { [key: string]: string } = {
      ChatGPT: "🤖",
      Gemini: "✨",
      Claude: "🧠",
      "Stable Diffusion": "🎨",
      "DALL-E": "🖼️",
      Midjourney: "🌟",
      Sora: "🎬",
      Runway: "🎭",
      Perplexity: "🔍",
      "GitHub Copilot": "👨‍💻",
    }
    return logos[agent] || "🤖"
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {AI_AGENTS.map((agent) => (
          <Card key={agent} className="animate-pulse">
            <CardContent className="p-4 text-center">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Browse by AI Agent</h2>
        <p className="text-gray-600 dark:text-gray-400">Discover prompts for your favorite AI platforms</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {AI_AGENTS.map((agent) => (
          <Card
            key={agent}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
              selectedAgent === agent
                ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            onClick={() => onAgentSelect(agent)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-4xl mb-2">{getAgentLogo(agent)}</div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">{agent}</h3>
              <Badge variant="secondary" className="text-xs">
                {agentStats[agent] || 0} prompts
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedAgent && (
        <div className="text-center">
          <button onClick={() => onAgentSelect("")} className="text-sm text-green-600 hover:text-green-700 underline">
            Clear filter
          </button>
        </div>
      )}
    </div>
  )
}
