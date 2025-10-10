/**
 * Comment Components Export Index
 * 
 * Centralized exports for all comment-related components
 */

export { default as CommentSection } from './CommentSection'
export { default as CommentForm } from './CommentForm'
export { default as CommentThread } from './CommentThread'
export { default as CommentActions } from './CommentActions'

// Re-export types for convenience
export type {
  Comment,
  CommentWithReplies,
  CreateCommentData,
  UpdateCommentData,
  CommentFilters,
  CommentsResponse,
  CommentNotification,
  CommentActivity
} from '@/types/comment'
