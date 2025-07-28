"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>(prompts)
  const [showCategories, setShowCategories] = useState(false)

  useEffect(() => {
    let filtered = prompts
    if (searchTerm) {
      filtered = filtered.filter((prompt) => prompt.title.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    setFilteredPrompts(filtered)
  }, [prompts, searchTerm])

  return (
    <aside className="w-full h-full flex flex-col">
      {/* Header with close button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Prompts</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Toggle Category Filter */}
      <div className="p-4 flex flex-col gap-4 bg-white/80 dark:bg-gray-900/80">
        <button
          className="w-full py-2 px-4 rounded-full bg-white/60 dark:bg-gray-800/60 shadow backdrop-blur font-semibold flex items-center justify-center gap-2 hover:bg-green-100 dark:hover:bg-green-900 transition-colors border border-green-100 dark:border-green-900"
          onClick={() => setShowCategories((prev) => !prev)}
        >
          {showCategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showCategories ? "Hide Categories" : "Show Categories"}
        </button>
        {showCategories && (
          <div className="flex flex-wrap overflow-scroll  gap-2 ">
            {CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full px-4 py-1 text-xs font-medium shadow-sm transition-all duration-150 cursor-pointer ${
                  selectedCategory === category
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-white/70 dark:bg-gray-800/70 text-green-700 hover:bg-green-100 dark:hover:bg-green-900 border border-green-200 dark:border-green-800"
                }`}
                onClick={() => {
                  onCategoryFilter(selectedCategory === category ? "" : category)
                  // Close the category dropdown after selection
                  setShowCategories(false)
                }}
              >
                {category}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Prompt Titles List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-3 pb-4">
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <p className="text-sm">No prompts found</p>
            </div>
          ) : (
            filteredPrompts.map((prompt) => {
              const isActive = selectedPromptId === prompt._id && tempSelectedPromptId === prompt._id;
              return (
                <div
                  key={prompt._id}
                  className={` px-5 py-3 font-medium text-sm shadow-sm cursor-pointer transition-all duration-150 select-none flex items-center justify-between gap-2
                    ${isActive
                      ? "bg-green-600 text-white scale-105 shadow-lg ring-2 ring-green-400"
                      : "bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white hover:bg-green-50 dark:hover:bg-green-900 hover:scale-105 hover:shadow-md border border-green-100 dark:border-green-900"}
                  `}
                  onClick={() => onPromptSelect(prompt._id)}
                >
                  <span className="truncate">{prompt.title}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
