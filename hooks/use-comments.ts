/**
 * Comments Management Hook
 * 
 * Custom hook for managing comment-related operations and state.
 * Provides real-time comment functionality with optimistic updates.
 */

"use client"

import { useState, useEffect, useCallback } from 'react'
import { CommentWithReplies, CommentsResponse, CommentActivity } from '@/types/comment'
import { toast } from 'sonner'

interface UseCommentsOptions {
  promptId?: string
  userId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseCommentsReturn {
  comments: CommentWithReplies[]
  loading: boolean
  error: string | null
  total: number
  hasMore: boolean
  createComment: (content: string, parentId?: string) => Promise<CommentWithReplies | null>
  updateComment: (commentId: string, content: string) => Promise<boolean>
  deleteComment: (commentId: string) => Promise<boolean>
  likeComment: (commentId: string) => Promise<boolean>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export function useComments({ 
  promptId, 
  userId, 
  autoRefresh = false, 
  refreshInterval = 30000 
}: UseCommentsOptions = {}): UseCommentsReturn {
  const [comments, setComments] = useState<CommentWithReplies[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [sortBy] = useState<'newest' | 'oldest' | 'mostLiked'>('newest')

  // Load comments
  const loadComments = useCallback(async (reset: boolean = false) => {
    if (!promptId) return

    try {
      if (reset) {
        setLoading(true)
        setComments([])
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
    }
  }, [promptId, sortBy, comments.length])

  // Create comment
  const createComment = useCallback(async (
    content: string, 
    parentId?: string
  ): Promise<CommentWithReplies | null> => {
    if (!promptId) return null

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
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

      const newComment: CommentWithReplies = {
        ...data.data.comment,
        replies: [],
        replyCount: 0
      }

      // Add to local state
      if (parentId) {
        // Add as reply
        setComments(prev => prev.map(comment => {
          if (comment._id === parentId) {
            return {
              ...comment,
              replies: [...comment.replies, newComment],
              replyCount: comment.replyCount + 1
            }
          }
          return comment
        }))
      } else {
        // Add as top-level comment
        setComments(prev => [newComment, ...prev])
        setTotal(prev => prev + 1)
      }

      toast.success(parentId ? 'Reply posted!' : 'Comment posted!')
      return newComment
    } catch (error) {
      console.error('Error creating comment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to post comment')
      return null
    }
  }, [promptId])

  // Update comment
  const updateComment = useCallback(async (
    commentId: string, 
    content: string
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: content.trim() })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update comment')
      }

      // Update local state
      const updateCommentInTree = (comments: CommentWithReplies[]): CommentWithReplies[] => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              content: data.data.comment.content,
              isEdited: data.data.comment.isEdited,
              editedAt: data.data.comment.editedAt
            }
          }
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentInTree(comment.replies)
            }
          }
          return comment
        })
      }

      setComments(prev => updateCommentInTree(prev))
      toast.success('Comment updated!')
      return true
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update comment')
      return false
    }
  }, [])

  // Delete comment
  const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete comment')
      }

      // Remove from local state
      const removeCommentFromTree = (comments: CommentWithReplies[]): CommentWithReplies[] => {
        return comments.filter(comment => {
          if (comment._id === commentId) {
            return false
          }
          if (comment.replies.length > 0) {
            comment.replies = removeCommentFromTree(comment.replies)
          }
          return true
        })
      }

      setComments(prev => removeCommentFromTree(prev))
      setTotal(prev => Math.max(0, prev - 1))
      toast.success('Comment deleted!')
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment')
      return false
    }
  }, [])

  // Like comment
  const likeComment = useCallback(async (commentId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to toggle like')
      }

      // Update local state
      const updateLikeInTree = (comments: CommentWithReplies[]): CommentWithReplies[] => {
        return comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              likes: data.data.likes,
              likedBy: data.data.liked 
                ? [...comment.likedBy, userId!]
                : comment.likedBy.filter(id => id !== userId)
            }
          }
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateLikeInTree(comment.replies)
            }
          }
          return comment
        })
      }

      setComments(prev => updateLikeInTree(prev))
      return true
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update like')
      return false
    }
  }, [userId])

  // Load more comments
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    await loadComments(false)
  }, [hasMore, loading, loadComments])

  // Refresh comments
  const refresh = useCallback(async () => {
    await loadComments(true)
  }, [loadComments])

  // Initial load
  useEffect(() => {
    if (promptId) {
      loadComments(true)
    }
  }, [promptId, loadComments])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !promptId) return

    const interval = setInterval(() => {
      loadComments(true)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, promptId, refreshInterval, loadComments])

  return {
    comments,
    loading,
    error,
    total,
    hasMore,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    loadMore,
    refresh
  }
}

/**
 * Hook for user comment activity
 */
export function useUserCommentActivity(userId?: string) {
  const [activity, setActivity] = useState<CommentActivity | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadActivity = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}/comments/activity`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to load activity')
      }

      setActivity(data.data)
    } catch (err) {
      console.error('Error loading comment activity:', err)
      setError(err instanceof Error ? err.message : 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadActivity()
  }, [loadActivity])

  return {
    activity,
    loading,
    error,
    refresh: loadActivity
  }
}
