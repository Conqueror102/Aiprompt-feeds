// Component for displaying a grid of prompts
import { Prompt } from '@/types'
import PromptCard from '@/components/PromptCard'
import PromptCardSkeleton from '@/components/PromptCardSkeleton'

interface PromptGridProps {
  prompts: Prompt[]
  loading: boolean
  currentUserId?: string
  likedPromptIds: Set<string>
  savedPromptIds: Set<string>
  selectedPromptId?: string | null
  tempSelectedPromptId?: string | null
  onLike: (promptId: string) => void
  onSave: (promptId: string) => void
  onViewDetails: (promptId: string) => void
  onComment?: (promptId: string) => void
}

export default function PromptGrid({
  prompts,
  loading,
  currentUserId,
  likedPromptIds,
  savedPromptIds,
  selectedPromptId,
  tempSelectedPromptId,
  onLike,
  onSave,
  onViewDetails,
  onComment,
}: PromptGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index}>
            <PromptCardSkeleton />
          </div>
        ))}
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
          No prompts found. Be the first to add one!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {prompts.map((prompt) => (
        <div key={prompt._id} id={`prompt-${prompt._id}`}>
          <PromptCard
            prompt={prompt}
            currentUserId={currentUserId}
            isLiked={likedPromptIds.has(prompt._id)}
            isSaved={savedPromptIds.has(prompt._id)}
            onLike={onLike}
            onSave={onSave}
            onViewDetails={onViewDetails}
            onComment={onComment}
            isSelected={selectedPromptId === prompt._id}
            tempSelectedPromptId={tempSelectedPromptId}
          />
        </div>
      ))}
    </div>
  )
}
