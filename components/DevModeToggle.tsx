"use client"
import { Code, Zap, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface DevModeToggleProps {
  isDevMode: boolean
  onToggle: (enabled: boolean) => void
}

export default function DevModeToggle({ isDevMode, onToggle }: DevModeToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={() => onToggle(!isDevMode)}
        variant={isDevMode ? "default" : "outline"}
        className={`relative overflow-hidden transition-all duration-300 ${
          isDevMode
            ? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <div className="flex items-center gap-2">
          {isDevMode ? <Terminal className="h-4 w-4" /> : <Code className="h-4 w-4" />}
          <span className="font-medium">{isDevMode ? "Exit Dev Mode" : "Activate Dev Mode"}</span>
          <Zap className={`h-4 w-4 ${isDevMode ? "animate-pulse" : ""}`} />
        </div>
        {isDevMode && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        )}
      </Button>

      {isDevMode && (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <Terminal className="h-3 w-3 mr-1" />
          Developer Mode Active
        </Badge>
      )}
    </div>
  )
}
