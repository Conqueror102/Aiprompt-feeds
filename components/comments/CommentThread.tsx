/**
 * Comment Thread Component
 * 
 * Displays a single comment with its replies in a threaded format.
 * Supports nested replies up to 3-4 levels deep.
 */

"use client"

import { useState } from 'react'
import { CommentWithReplies } from '@/types/comment'
import CommentForm from './CommentForm'
import CommentActions from './CommentActions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentThreadProps {
  comment: CommentWithReplies
  promptId: string
  onUpdate: (commentId: string, updatedComment: CommentWithReplies) => void
  onDelete: (commentId: string) => void
  onReplyAdded: (parentId: string, newReply: CommentWithReplies) => void
  currentUserId?: string
  depth?: number
  maxDepth?: number
}

export default function CommentThread({
  comment,
  promptId,
  onUpdate,
  onDelete,
  onReplyAdded,
  currentUserId,
  depth = 0,
  maxDepth = 3
}: CommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const isAuthor = currentUserId === comment.authorId
  const canReply = depth < maxDepth
  const hasReplies = comment.replies.length > 0

  // Handle reply creation
  const handleReplyCreated = (newReply: CommentWithReplies) => {
    onReplyAdded(comment._id, newReply)
    setShowReplyForm(false)
  }

  // Handle comment edit
  const handleEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false)
      setEditContent(comment.content)
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')

      const response = await fetch(`/api/comments/${comment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent.trim() })
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      const updatedComment: CommentWithReplies = {
        ...data.data.comment,
        replies: comment.replies,
        replyCount: comment.replyCount
      }

      onUpdate(comment._id, updatedComment)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating comment:', error)
      setEditContent(comment.content)
      setIsEditing(false)
    }
  }

  // Handle comment delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No authentication token')

      const response = await fetch(`/api/comments/${comment._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!data.success) throw new Error(data.error)

      onDelete(comment._id)
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  // Calculate indentation based on depth
  const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 12)}` : ''

  return (
    <div className={cn("space-y-3", indentClass)}>
      {/* Main Comment */}
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback>
            {comment.author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>
          
          {/* Comment Content */}
          <div className="mb-2">
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[60px]"
                  maxLength={2000}
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleEdit}>
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {comment.isDeleted ? (
                  <span className="italic text-gray-500">[Comment deleted]</span>
                ) : (
                  comment.content
                )}
              </p>
            )}
          </div>
          
          {/* Comment Actions */}
          {!comment.isDeleted && (
            <CommentActions
              comment={comment}
              currentUserId={currentUserId}
              canReply={canReply}
              onReply={() => setShowReplyForm(!showReplyForm)}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && canReply && (
        <div className="ml-11">
          <CommentForm
            promptId={promptId}
            parentId={comment._id}
            onCommentCreated={handleReplyCreated}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`Reply to ${comment.author.name}...`}
            autoFocus
          />
        </div>
      )}

      {/* Replies */}
      {hasReplies && (
        <div className="ml-11 space-y-3">
          {/* Toggle Replies Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="h-6 px-2 text-xs text-gray-600 dark:text-gray-400"
          >
            {showReplies ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Hide {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </>
            )}
          </Button>

          {/* Replies List */}
          {showReplies && (
            <div className="space-y-3 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
              {comment.replies.map((reply) => (
                <CommentThread
                  key={reply._id}
                  comment={reply}
                  promptId={promptId}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onReplyAdded={onReplyAdded}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
