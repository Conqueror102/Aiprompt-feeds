/**
 * Comment Section Component
 * 
 * Main container for all comments on a prompt.
 * Handles loading, pagination, and real-time updates.
 */

"use client"

import { useState, useEffect } from 'react'
import { CommentWithReplies, CommentsResponse } from '@/types/comment'
import CommentForm from './CommentForm'
import CommentThread from './CommentThread'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface CommentSectionProps {
  promptId: string
  initialCommentCount?: number
  className?: string
}

export default function CommentSection({
  promptId,
  initialCommentCount = 0,
  className
}: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked'>('newest')
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(initialCommentCount)
  const [error, setError] = useState<string | null>(null)

  // Load comments
  const loadComments = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true)
        setComments([])
      } else {
        setLoadingMore(true)
      }

      setError(null)

      const offset = reset ? 0 : comments.length
      const response = await fetch(
        `/api/comments?promptId=${promptId}&sortBy=${sortBy}&limit=20&offset=${offset}`
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to load comments')
      }

      const result: CommentsResponse = data.data

      if (reset) {
        setComments(result.comments)
      } else {
        setComments(prev => [...prev, ...result.comments])
      }

      setHasMore(result.hasMore)
      setTotal(result.total)
    } catch (err) {
      console.error('Error loading comments:', err)
      setError(err instanceof Error ? err.message : 'Failed to load comments')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load comments on mount and when sort changes
  useEffect(() => {
    loadComments(true)
  }, [promptId, sortBy])

  // Handle new comment
  const handleNewComment = (newComment: CommentWithReplies) => {
    setComments(prev => [newComment, ...prev])
    setTotal(prev => prev + 1)
  }

  // Handle comment update
  const handleCommentUpdate = (commentId: string, updatedComment: CommentWithReplies) => {
    setComments(prev => prev.map(comment =>
      comment._id === commentId ? updatedComment : comment
    ))
  }

  // Handle comment delete
  const handleCommentDelete = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId))
    setTotal(prev => Math.max(0, prev - 1))
  }

  // Handle reply added
  const handleReplyAdded = (parentId: string, newReply: CommentWithReplies) => {
    setComments(prev => prev.map(comment => {
      if (comment._id === parentId) {
        return {
          ...comment,
          replies: [...comment.replies, newReply],
          replyCount: comment.replyCount + 1
        }
      }
      return comment
    }))
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading comments...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments ({total})
          </CardTitle>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="mostLiked">Most Liked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Comment Form */}
        {user && (
          <CommentForm
            promptId={promptId}
            onCommentCreated={handleNewComment}
            placeholder="Share your thoughts on this prompt..."
          />
        )}

        {!user && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p>Please log in to leave a comment</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadComments(true)}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 && !error ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts on this prompt!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentThread
                key={comment._id}
                comment={comment}
                promptId={promptId}
                onUpdate={handleCommentUpdate}
                onDelete={handleCommentDelete}
                onReplyAdded={handleReplyAdded}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => loadComments(false)}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Comments'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
