"use client"

import { useState, useMemo } from "react"
import { Search, X, ChevronDown, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CATEGORIES } from "@/lib/constants"

interface Prompt {
  _id: string
  title: string
  category: string
  aiAgents: string[]
  likes: number
  createdAt: string
}

interface PromptSidebarProps {
  prompts: Prompt[]
  onPromptSelect: (promptId: string) => void
  onCategoryFilter: (category: string) => void
  selectedPromptId?: string
  tempSelectedPromptId?: string | null
  selectedCategory?: string
  onClose?: () => void
}

export default function PromptSidebar({
  prompts,
  onPromptSelect,
  onCategoryFilter,
  selectedPromptId,
  tempSelectedPromptId,
  selectedCategory,
  onClose,
}: PromptSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Group prompts by category
  const promptsByCategory = useMemo(() => {
    const grouped: Record<string, Prompt[]> = {}
    
    prompts.forEach((prompt) => {
      if (!grouped[prompt.category]) {
        grouped[prompt.category] = []
      }
      grouped[prompt.category].push(prompt)
    })
    
    return grouped
  }, [prompts])

  // Filter categories and prompts based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return promptsByCategory

    const filtered: Record<string, Prompt[]> = {}
    Object.entries(promptsByCategory).forEach(([category, categoryPrompts]) => {
      const matchingPrompts = categoryPrompts.filter((prompt) =>
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (matchingPrompts.length > 0) {
        filtered[category] = matchingPrompts
      }
    })
    return filtered
  }, [promptsByCategory, searchTerm])

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  return (
    <aside className="w-full h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header with close button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories with Dropdown Prompts */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.keys(filteredCategories).length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <p className="text-sm">No prompts found</p>
            </div>
          ) : (
            Object.entries(filteredCategories).map(([category, categoryPrompts]) => {
              const isExpanded = expandedCategories.has(category)
              const promptCount = categoryPrompts.length

              return (
                <div key={category} className="mb-2">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-green-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                      )}
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {category}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {promptCount}
                    </Badge>
                  </button>

                  {/* Prompts List */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {categoryPrompts.map((prompt) => {
                        const isActive = selectedPromptId === prompt._id || tempSelectedPromptId === prompt._id
                        return (
                          <div
                            key={prompt._id}
                            onClick={() => {
                              onPromptSelect(prompt._id)
                              if (onClose) {
                                onClose()
                              }
                            }}
                            className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-all ${
                              isActive
                                ? "bg-green-600 text-white font-medium shadow-md"
                                : "text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate">{prompt.title}</span>
                              {isActive && (
                                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
