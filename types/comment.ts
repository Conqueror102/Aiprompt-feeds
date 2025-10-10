/**
 * Comment System Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the comment system.
 * Comments allow users to discuss and provide feedback on prompts.
 */

/**
 * Comment interface - represents a single comment
 */
export interface Comment {
  _id: string
  content: string
  promptId: string
  authorId: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  parentId?: string // For nested replies (max 3-4 levels)
  depth: number // 0 = top-level, 1-3 = reply levels
  likes: number
  likedBy: string[] // User IDs who liked this comment
  isEdited: boolean
  editedAt?: Date
  isDeleted: boolean
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Comment creation data
 */
export interface CreateCommentData {
  content: string
  promptId: string
  parentId?: string // For replies
}

/**
 * Comment update data
 */
export interface UpdateCommentData {
  content: string
}

/**
 * Comment with nested replies
 */
export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[]
  replyCount: number
}

/**
 * Comment thread - top-level comment with all its replies
 */
export interface CommentThread {
  comment: CommentWithReplies
  totalReplies: number
}

/**
 * Comment filters for querying
 */
export interface CommentFilters {
  promptId?: string
  authorId?: string
  parentId?: string | null // null for top-level comments
  sortBy?: 'newest' | 'oldest' | 'mostLiked'
  limit?: number
  offset?: number
}

/**
 * Comment API response
 */
export interface CommentsResponse {
  comments: CommentWithReplies[]
  total: number
  hasMore: boolean
}

/**
 * Comment notification types
 */
export enum CommentNotificationType {
  NEW_COMMENT = 'new_comment',
  COMMENT_REPLY = 'comment_reply',
  COMMENT_LIKE = 'comment_like'
}

/**
 * Comment notification
 */
export interface CommentNotification {
  id: string
  type: CommentNotificationType
  commentId: string
  promptId: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  message: string
  isRead: boolean
  createdAt: Date
}

/**
 * Comment activity for user profiles
 */
export interface CommentActivity {
  totalComments: number
  totalLikes: number
  recentComments: Comment[]
  topComments: Comment[] // Most liked comments
}
