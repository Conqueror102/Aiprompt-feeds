// Component for prompt filtering UI
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AI_AGENTS, CATEGORIES } from '@/lib/constants'

interface PromptFiltersProps {
  searchTerm: string
  selectedCategory: string
  selectedAgent: string
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onAgentChange: (value: string) => void
}

export default function PromptFilters({
  searchTerm,
  selectedCategory,
  selectedAgent,
  onSearchChange,
  onCategoryChange,
  onAgentChange,
}: PromptFiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAgent} onValueChange={onAgentChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="AI Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All AI Agents</SelectItem>
              {AI_AGENTS.map((agent) => (
                <SelectItem key={agent} value={agent}>
                  {agent}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
