/**
 * Comments Management Hook
 * 
 * Custom hook for managing comment-related operations and state.
 * Provides real-time comment functionality with optimistic updates.
 */

"use client"

import { useState, useEffect } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CommentWithReplies, CommentsResponse, CommentActivity } from '@/types/comment'
import { toast } from '@/hooks/use-toast'


interface UseCommentsOptions {
  promptId?: string
  userId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useComments({ 
  promptId, 
  userId, 
  autoRefresh = false, 
  refreshInterval = 30000 
}: UseCommentsOptions = {}) {
  const queryClient = useQueryClient()
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked'>('newest')

  // Query for comments
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage: hasMore, // Alias hasNextPage to hasMore
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['comments', promptId, sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      if (!promptId) return { comments: [], total: 0, hasMore: false }
      const response = await fetch(
        `/api/comments?promptId=${promptId}&sortBy=${sortBy}&limit=10&offset=${pageParam}`
      )
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to load comments')
      return data.data as CommentsResponse
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) {
        return allPages.flatMap(p => p.comments).length
      }
      return undefined
    },
    enabled: !!promptId,
    refetchInterval: autoRefresh ? refreshInterval : false
  })

  // Helper to get flattened comments
  const comments = data?.pages.flatMap(page => page.comments) || []
  const total = data?.pages[0]?.total || 0

  // Create Comment Mutation
  const createMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string, parentId?: string }) => {
      if (!promptId) throw new Error('No prompt ID')
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: content.trim(), promptId, parentId })
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to create comment')
      return data.data.comment
    },
    onSuccess: (newComment, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', promptId] })
      toast({ 
        title: 'Success', 
        description: variables.parentId ? 'Reply posted!' : 'Comment posted!' 
      })
      
      // Update global prompt cache for comment count
      if (!variables.parentId) {
         // This is a bit looser now since prompts query structure is complex
         // Ideally we invalidate getting specific prompt
         queryClient.invalidateQueries({ queryKey: ['prompts'] }) 
         // Or optimistically update if we had a specific prompt query
      }
    },
    onError: (err) => {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to post comment',
        variant: 'destructive'
      })
    }
  })

  // Update Comment Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string, content: string }) => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')
      
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: content.trim() })
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to update comment')
      return data.data.comment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', promptId] })
      toast({ title: 'Success', description: 'Comment updated!' })
    },
    onError: (err) => {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to update comment',
        variant: 'destructive'
      })
    }
  })

  // Delete Comment Mutation
  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')
      
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to delete comment')
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', promptId] })
      queryClient.invalidateQueries({ queryKey: ['prompts'] }) // Update comment counts
      toast({ title: 'Success', description: 'Comment deleted!' })
    },
    onError: (err) => {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to delete comment',
        variant: 'destructive'
      })
    }
  })

  // Like Comment Mutation
  const likeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Authentication required')
      
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to toggle like')
      return data.data
    },
    onMutate: async (commentId: string) => {
      const token = localStorage.getItem('token')
      if (!token) {
        toast({ 
            title: 'Sign in required', 
            description: 'Please sign in to like comments',
            variant: 'destructive'
        })
        throw new Error('Sign in required')
      }

      await queryClient.cancelQueries({ queryKey: ['comments', promptId] })
      const previousData = queryClient.getQueryData(['comments', promptId, sortBy])
      
      // Optimistic update
      queryClient.setQueriesData({ queryKey: ['comments', promptId] }, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            comments: page.comments.map((comment: CommentWithReplies) => {
              // Update top-level comment
              if (comment._id === commentId) {
                const wasLiked = comment.likedBy.includes(userId || '')
                const newLikedBy = wasLiked 
                  ? comment.likedBy.filter(id => id !== userId)
                  : [...comment.likedBy, userId || '']
                return {
                  ...comment,
                  likes: Math.max(0, comment.likes + (wasLiked ? -1 : 1)),
                  likedBy: newLikedBy
                }
              }
              // Check replies
              if (comment.replies) {
                return {
                  ...comment,
                  replies: comment.replies.map(reply => {
                    if (reply._id === commentId) {
                      const wasLiked = reply.likedBy.includes(userId || '')
                      const newLikedBy = wasLiked 
                        ? reply.likedBy.filter(id => id !== userId)
                        : [...reply.likedBy, userId || '']
                      return {
                        ...reply,
                        likes: Math.max(0, reply.likes + (wasLiked ? -1 : 1)),
                        likedBy: newLikedBy
                      }
                    }
                    return reply
                  })
                }
              }
              return comment
            })
          }))
        }
      })
      
      return { previousData }
    },
    onError: (err, commentId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['comments', promptId, sortBy], context.previousData)
      }
      
      // If it's not the sign-in error we already toasted for, show generic error
      if (err.message !== 'Sign in required') {
        toast({ 
            title: 'Error', 
            description: err instanceof Error ? err.message : 'Failed to update like',
            variant: 'destructive'
        })
      }
    },
    onSettled: () => {
       queryClient.invalidateQueries({ queryKey: ['comments', promptId] })
    }
  })

  return {
    comments,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    total,
    hasMore,
    sortBy,
    setSortBy,
    createComment: async (content: string, parentId?: string) => createMutation.mutateAsync({ content, parentId }),
    updateComment: async (commentId: string, content: string) => { await updateMutation.mutateAsync({ commentId, content }); return true },
    deleteComment: async (commentId: string) => { await deleteMutation.mutateAsync(commentId); return true },
    likeComment: async (commentId: string) => { 
        try { 
            await likeMutation.mutateAsync(commentId); 
            return true 
        } catch { 
            return false 
        } 
    },
    loadMore: async () => { await fetchNextPage() },
    refresh: async () => { await refetch() }
  }
}

/**
 * Hook for user comment activity
 */
export function useUserCommentActivity(userId?: string) {
  // Can be migrated later if needed, low priority
  const [activity, setActivity] = useState<CommentActivity | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Kept as is for now to minimize scope, but effectively could be a useQuery
  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetch(`/api/users/${userId}/comments/activity`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setActivity(data.data)
        else throw new Error(data.error)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  return { activity, loading, error, refresh: () => {} }
}
