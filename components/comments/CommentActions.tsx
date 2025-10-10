/**
 * Comment Actions Component
 * 
 * Action buttons for comments (like, reply, edit, delete).
 * Handles real-time like updates and permission checks.
 */

"use client"

import { useState } from 'react'
import { CommentWithReplies } from '@/types/comment'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useBadgeChecker } from '@/hooks/use-badges'

interface CommentActionsProps {
  comment: CommentWithReplies
  currentUserId?: string
  canReply: boolean
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function CommentActions({
  comment,
  currentUserId,
  canReply,
  onReply,
  onEdit,
  onDelete
}: CommentActionsProps) {
  const [likes, setLikes] = useState(comment.likes)
  const [isLiked, setIsLiked] = useState(
    currentUserId ? comment.likedBy.includes(currentUserId) : false
  )
  const [isLiking, setIsLiking] = useState(false)
  const { checkAfterCommentLike } = useBadgeChecker()

  const isAuthor = currentUserId === comment.authorId
  const isLoggedIn = !!currentUserId

  // Handle like toggle
  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to like comments')
      return
    }

    if (isLiking) return

    setIsLiking(true)

    // Optimistic update
    const newIsLiked = !isLiked
    const newLikes = newIsLiked ? likes + 1 : Math.max(0, likes - 1)

    setIsLiked(newIsLiked)
    setLikes(newLikes)

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')

      const response = await fetch(`/api/comments/${comment._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      // Update with server response
      setIsLiked(data.data.liked)
      setLikes(data.data.likes)
      checkAfterCommentLike()
    } catch (error) {
      console.error('Error toggling like:', error)

      // Revert optimistic update
      setIsLiked(!newIsLiked)
      setLikes(likes)

      toast.error('Failed to update like')
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Like Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLiking}
        className={cn(
          "h-6 px-2 text-xs",
          isLiked
            ? "text-red-600 hover:text-red-700 dark:text-red-400"
            : "text-gray-600 hover:text-gray-700 dark:text-gray-400"
        )}
      >
        <Heart
          className={cn(
            "w-3 h-3 mr-1",
            isLiked && "fill-current"
          )}
        />
        {likes > 0 && likes}
      </Button>

      {/* Reply Button */}
      {canReply && isLoggedIn && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReply}
          className="h-6 px-2 text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400"
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          Reply
        </Button>
      )}

      {/* Author Actions */}
      {isAuthor && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="w-3 h-3 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
