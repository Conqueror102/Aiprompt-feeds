"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { X, Wrench, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DevFiltersProps {
  selectedTechnologies: string[]
  selectedTools: string[]
  onTechnologiesChange: (technologies: string[]) => void
  onToolsChange: (tools: string[]) => void
}

export default function DevFilters({
  selectedTechnologies,
  selectedTools,
  onTechnologiesChange,
  onToolsChange,
}: DevFiltersProps) {
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([])
  const [availableTools, setAvailableTools] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDevMetadata()
  }, [])

  const fetchDevMetadata = async () => {
    try {
      const response = await fetch("/api/prompts/filters/dev-metadata")
      if (response.ok) {
        const data = await response.json()
        setAvailableTechnologies(data.technologies || [])
        setAvailableTools(data.tools || [])
      }
    } catch (error) {
      console.error("Failed to fetch dev metadata:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTechnology = (tech: string) => {
    if (selectedTechnologies.includes(tech)) {
      onTechnologiesChange(selectedTechnologies.filter((t) => t !== tech))
    } else {
      onTechnologiesChange([...selectedTechnologies, tech])
    }
  }

  const toggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      onToolsChange(selectedTools.filter((t) => t !== tool))
    } else {
      onToolsChange([...selectedTools, tool])
    }
  }

  const clearAll = () => {
    onTechnologiesChange([])
    onToolsChange([])
  }

  if (loading) {
    return (
      <div className="flex gap-2 items-center text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        Loading filters...
      </div>
    )
  }

  const hasActiveFilters = selectedTechnologies.length > 0 || selectedTools.length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dev Filters:</span>
        
        {/* Technologies Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Code2 className="h-3.5 w-3.5 mr-1.5" />
              Technologies
              {selectedTechnologies.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                  {selectedTechnologies.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
            {availableTechnologies.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-gray-500">No technologies found</div>
            ) : (
              availableTechnologies.map((tech) => (
                <DropdownMenuCheckboxItem
                  key={tech}
                  checked={selectedTechnologies.includes(tech)}
                  onCheckedChange={() => toggleTechnology(tech)}
                >
                  {tech}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tools Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Wrench className="h-3.5 w-3.5 mr-1.5" />
              Tools
              {selectedTools.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                  {selectedTools.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
            {availableTools.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-gray-500">No tools found</div>
            ) : (
              availableTools.map((tool) => (
                <DropdownMenuCheckboxItem
                  key={tool}
                  checked={selectedTools.includes(tool)}
                  onCheckedChange={() => toggleTool(tool)}
                >
                  {tool}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-xs">
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedTechnologies.map((tech) => (
            <Badge key={tech} variant="secondary" className="gap-1">
              <Code2 className="h-3 w-3" />
              {tech}
              <button
                onClick={() => toggleTechnology(tech)}
                className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedTools.map((tool) => (
            <Badge key={tool} variant="secondary" className="gap-1">
              <Wrench className="h-3 w-3" />
              {tool}
              <button
                onClick={() => toggleTool(tool)}
                className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
