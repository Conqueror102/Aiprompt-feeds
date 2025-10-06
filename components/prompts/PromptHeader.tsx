// Component for the prompts page header
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PromptHeaderProps {
  showAIAgentCollections: boolean
  onToggleAIAgentCollections: () => void
}

export default function PromptHeader({
  showAIAgentCollections,
  onToggleAIAgentCollections,
}: PromptHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discover AI Prompts
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Browse and share the best prompts for AI agents
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            className="px-3 py-2 text-sm rounded-md border border-green-600 text-green-700 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
            onClick={onToggleAIAgentCollections}
          >
            {showAIAgentCollections ? 'Hide' : 'Browse by AI Agent'}
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Link href="/explore">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="hidden sm:inline">Explore</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
