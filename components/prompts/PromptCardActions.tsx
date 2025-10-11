// Component for prompt card action buttons
import { Heart, Bookmark, Copy, ExternalLink, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PromptCardActionsProps {
  liked: boolean
  saved: boolean
  likesCount: number
  commentCount?: number
  onLike: () => void
  onSave: () => void
  onCopy: () => void
  onRun: () => void
  onComment?: () => void
}

export default function PromptCardActions({
  liked,
  saved,
  likesCount,
  commentCount = 0,
  onLike,
  onSave,
  onCopy,
  onRun,
  onComment,
}: PromptCardActionsProps) {
  return (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={`hover:scale-105 transition-transform ${liked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
            }`}
        >
          <Heart className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
          <span className="text-xs sm:text-sm">{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          className={`hover:scale-105 transition-transform ${saved ? 'text-blue-500 hover:text-blue-600' : 'text-gray-500 hover:text-blue-500'
            }`}
        >
          <Bookmark className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${saved ? 'fill-current' : ''}`} />
          <span className="hidden sm:inline">Save</span>
        </Button>

        {onComment && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="hover:scale-105 transition-transform text-gray-500 hover:text-green-600"
          >
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="text-xs sm:text-sm">{commentCount}</span>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onCopy}
          size="sm"
          variant="outline"
          className="hover:scale-105 hover:border-green-500 transition-all"
        >
          <Copy className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="hover:scale-105 hover:border-green-500 transition-all"
          onClick={onRun}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
