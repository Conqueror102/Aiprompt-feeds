/**
 * Comment Form Component
 * 
 * Form for creating new comments or replies.
 * Supports both top-level comments and nested replies.
 */

"use client"

import { useState } from 'react'
import { CommentWithReplies } from '@/types/comment'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { useBadgeChecker } from '@/hooks/use-badges'

interface CommentFormProps {
  promptId: string
  parentId?: string // For replies
  onCommentCreated: (comment: CommentWithReplies) => void
  onCancel?: () => void // For reply forms
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

export default function CommentForm({
  promptId,
  parentId,
  onCommentCreated,
  onCancel,
  placeholder = "Write a comment...",
  autoFocus = false,
  className
}: CommentFormProps) {
  const { user } = useAuth()
  const { checkAfterComment } = useBadgeChecker()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error('Please enter a comment')
      return
    }

    if (content.trim().length > 2000) {
      toast.error('Comment is too long (max 2000 characters)')
      return
    }

    if (!user) {
      toast.error('Please log in to comment')
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: content.trim(),
          promptId,
          parentId
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create comment')
      }

      // Create a CommentWithReplies object
      const newComment: CommentWithReplies = {
        ...data.data.comment,
        replies: [],
        replyCount: 0
      }

      onCommentCreated(newComment)
      setContent('')

      toast.success(parentId ? 'Reply posted!' : 'Comment posted!')
      checkAfterComment()

      // Close reply form if this was a reply
      if (parentId && onCancel) {
        onCancel()
      }
    } catch (error) {
      console.error('Error creating comment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  if (!user) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={isSubmitting}
            className="min-h-[80px] resize-none"
            maxLength={2000}
          />

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {content.length}/2000 characters
              {content.length > 0 && (
                <span className="ml-2">
                  Press Ctrl+Enter to submit
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {parentId && onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {parentId ? 'Reply' : 'Comment'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
