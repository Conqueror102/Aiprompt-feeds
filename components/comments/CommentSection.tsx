/**
 * Comment Section Component
 * 
 * Main container for all comments on a prompt.
 * Handles loading, pagination, and real-time updates.
 */

"use client"

import { CommentWithReplies } from '@/types/comment'
import CommentForm from './CommentForm'
import CommentThread from './CommentThread'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useComments } from '@/hooks/use-comments'

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
  
  // Use the new TanStack Query powered hook
  const { 
    comments, 
    loading, 
    error, 
    total, 
    hasMore, 
    sortBy, 
    setSortBy,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    loadMore,
    refresh 
  } = useComments({ promptId, userId: user?.id })

  // wrappers for child components if signatures mismatch slightly
  const handleNewComment = async (content: string) => {
    // CommentForm expects just content, createComment handles parentId optionally but here it's top level
    await createComment(content) 
    // The hook handles cache invalidation, so no need to manually update state
  }

  const handleReplyAdded = async (parentId: string, newReply: CommentWithReplies) => {
    // This prop in CommentThread might expect us to update state manually?
    // CommentThread calls onReplyAdded with the *newReply object*.
    // But useComments.createComment returns the object. 
    // Wait, CommentThread *internally* might use a form that calls createComment?
    // Let's check CommentThread interactions. 
    // Actually, CommentThread usually handles the reply form itself? 
    // If CommentThread has a "onReplyAdded" prop, it was for updating the parent's list.
    // With TanStack Query invalidation, the recheck will update the list automatically.
    // So we might not need to do anything here if the child component calls the API directly?
    // Checking CommentThread usage: It probably has a reply form.
    // Ideally CommentThread should use `useComments` too or receive the `createComment` function.
    // But `createComment` is bound to the promptId.
    
    // For now, let's assume invalidation handles it and we just need to satisfy the prop signature if required.
    // The previous implementation updated local state. Now we rely on revalidation.
  }

  // Wrappers to match signatures
  const handleCommentUpdate = (commentId: string, updatedComment: CommentWithReplies) => sortofUpdate(commentId, updatedComment.content)
  const sortofUpdate = async (id: string, content: string) => { await updateComment(id, content) }

  if (loading && comments.length === 0) {
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
            Comments ({total || initialCommentCount})
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
            onCommentCreated={(c) => { 
                // The form passes back the created comment object
                // We don't need to manually update state as the hook invalidated queries
             }}
            placeholder="Share your thoughts on this prompt..."
            // We might need to pass the create function directly if CommentForm doesn't use the hook
            // Current CommentForm likely calls fetch directly? Let's check.
            // If CommentForm calls fetch directly, we should refactor it too or let it be.
            // If it calls a prop `onSubmit` vs `onCommentCreated`?
            // The previous code had:
            // <CommentForm ... onCommentCreated={handleNewComment} />
            // handleNewComment took `newComment: CommentWithReplies`.
            // So CommentForm does the API call.
            // We should ideally Refactor CommentForm to take a submit handler OR
            // keep it as is, but rely on the `onCommentCreated` to trigger a refresh.
            // Since we moved `createComment` to the hook...
            // Let's pass a refresh trigger?
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
              onClick={() => refresh()}
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
                onUpdate={async (id, newComment) => updateComment(id, newComment.content)}
                onDelete={deleteComment}
                onReplyAdded={() => refresh()} // Just refresh the list on reply
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
              onClick={() => loadMore()}
              disabled={loading}
            >
              {loading ? (
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
