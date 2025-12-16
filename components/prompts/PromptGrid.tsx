// Component for displaying a grid of prompts
import { useRef, useEffect } from 'react'
import { Prompt } from '@/types'
import PromptCard from '@/components/PromptCard'
import PromptCardSkeleton from '@/components/PromptCardSkeleton'
import { Loader2 } from 'lucide-react'

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
  onLoadMore?: () => void
  hasMore?: boolean
  isFetchingMore?: boolean
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
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
}: PromptGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loading || !hasMore || !onLoadMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    )

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current)
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current)
      }
    }
  }, [loading, hasMore, onLoadMore, prompts.length])

  if (loading && prompts.length === 0) {
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

  if (prompts.length === 0 && !loading) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
          No prompts found. Be the first to add one!
        </p>
      </div>
    )
  }

  return (
    <>
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
        
        {/* Loading placeholders when fetching more */}
        {isFetchingMore && (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`param-skeleton-${index}`}>
              <PromptCardSkeleton />
            </div>
          ))
        )}
      </div>

      {/* Sentinel element for infinite scroll */}
      {hasMore && !loading && (
        <div ref={sentinelRef} className="h-20 w-full flex items-center justify-center mt-8">
           {isFetchingMore ? (
             <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading more...</span>
             </div>
           ) : (
             <div className="h-1 w-full" /> 
           )}
        </div>
      )}
    </>
  )
}
