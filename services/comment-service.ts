/**
 * Comment Service
 * 
 * Core service for comment management, CRUD operations, and business logic.
 * Handles threaded comments with real-time updates.
 */

import {
  Comment as CommentType,
  CreateCommentData,
  UpdateCommentData,
  CommentFilters,
  CommentsResponse,
  CommentWithReplies
} from '@/types/comment'
import Comment from '@/lib/models/Comment'
import Prompt from '@/lib/models/Prompt'
import User from '@/lib/models/User'

export class CommentService {
  /**
   * Create a new comment or reply
   */
  static async createComment(data: CreateCommentData, authorId: string): Promise<CommentType> {
    try {
      // Validate prompt exists
      const prompt = await Prompt.findById(data.promptId)
      if (!prompt) {
        throw new Error('Prompt not found')
      }

      // If it's a reply, validate parent comment and depth
      let depth = 0
      if (data.parentId) {
        const parentComment = await Comment.findById(data.parentId)
        if (!parentComment) {
          throw new Error('Parent comment not found')
        }

        // Check if we're exceeding max depth (3 levels)
        if (parentComment.depth >= 3) {
          throw new Error('Maximum reply depth exceeded')
        }

        depth = parentComment.depth + 1
      }

      // Create the comment
      const comment = new Comment({
        content: data.content.trim(),
        promptId: data.promptId,
        authorId,
        parentId: data.parentId || null,
        depth
      })

      await comment.save()

      // Update prompt comment count (only for top-level comments)
      if (!data.parentId) {
        await Prompt.findByIdAndUpdate(
          data.promptId,
          { $inc: { commentCount: 1 } }
        )
      }

      // Populate author information
      await comment.populate('authorId', 'name avatar')

      return this.formatComment(comment)
    } catch (error) {
      console.error('Error creating comment:', error)
      throw error
    }
  }

  /**
   * Get comments for a prompt with pagination and threading
   */
  static async getPromptComments(
    promptId: string,
    filters: CommentFilters = {}
  ): Promise<CommentsResponse> {
    try {
      const {
        sortBy = 'newest',
        limit = 20,
        offset = 0
      } = filters

      const result = await Comment.getPromptComments(promptId, {
        page: Math.floor(offset / limit) + 1,
        limit,
        sortBy
      })

      return {
        comments: result.comments.map(comment => this.formatCommentWithReplies(comment)),
        total: result.total,
        hasMore: result.hasMore
      }
    } catch (error) {
      console.error('Error getting prompt comments:', error)
      throw error
    }
  }

  /**
   * Get replies for a specific comment
   */
  static async getCommentReplies(
    commentId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<CommentType[]> {
    try {
      const replies = await Comment.find({
        parentId: commentId,
        isDeleted: false
      })
        .populate('authorId', 'name avatar')
        .sort({ createdAt: 1 }) // Replies sorted oldest first
        .skip(offset)
        .limit(limit)
        .lean()

      return replies.map(reply => this.formatComment(reply))
    } catch (error) {
      console.error('Error getting comment replies:', error)
      throw error
    }
  }

  /**
   * Update a comment (only by author)
   */
  static async updateComment(
    commentId: string,
    data: UpdateCommentData,
    userId: string
  ): Promise<CommentType> {
    try {
      const comment = await Comment.findById(commentId)

      if (!comment) {
        throw new Error('Comment not found')
      }

      if (comment.authorId.toString() !== userId) {
        throw new Error('Not authorized to edit this comment')
      }

      if (comment.isDeleted) {
        throw new Error('Cannot edit deleted comment')
      }

      // Update comment
      comment.content = data.content.trim()
      comment.isEdited = true
      comment.editedAt = new Date()

      await comment.save()
      await comment.populate('authorId', 'name avatar')

      return this.formatComment(comment)
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }

  /**
   * Delete a comment (soft delete)
   */
  static async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      const comment = await Comment.findById(commentId)

      if (!comment) {
        throw new Error('Comment not found')
      }

      if (comment.authorId.toString() !== userId) {
        throw new Error('Not authorized to delete this comment')
      }

      // Soft delete
      comment.isDeleted = true
      comment.deletedAt = new Date()
      comment.content = '[Comment deleted]'

      await comment.save()

      // Update prompt comment count (only for top-level comments)
      if (!comment.parentId) {
        await Prompt.findByIdAndUpdate(
          comment.promptId,
          { $inc: { commentCount: -1 } }
        )
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }

  /**
   * Like/unlike a comment
   */
  static async toggleCommentLike(commentId: string, userId: string): Promise<{ liked: boolean; likes: number }> {
    try {
      const comment = await Comment.findById(commentId)

      if (!comment) {
        throw new Error('Comment not found')
      }

      if (comment.isDeleted) {
        throw new Error('Cannot like deleted comment')
      }

      const isLiked = comment.likedBy.some((id: any) => id.toString() === userId)

      if (isLiked) {
        // Unlike
        comment.likedBy = comment.likedBy.filter((id: any) => id.toString() !== userId)
        comment.likes = Math.max(0, comment.likes - 1)
      } else {
        // Like
        // Ensure we push the correct type for likedBy (ObjectId)
        comment.likedBy.push((comment as any).constructor.db.base.Types.ObjectId.createFromHexString(userId))
        comment.likes += 1
      }

      await comment.save()

      return {
        liked: !isLiked,
        likes: comment.likes
      }
    } catch (error) {
      console.error('Error toggling comment like:', error)
      throw error
    }
  }

  /**
   * Get user's comment activity
   */
  static async getUserCommentActivity(userId: string) {
    try {
      const [totalComments, totalLikes, recentComments, topComments] = await Promise.all([
        // Total comments count
        Comment.countDocuments({ authorId: userId, isDeleted: false }),

        // Total likes received
        Comment.aggregate([
          { $match: { authorId: userId, isDeleted: false } },
          { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
        ]).then(result => result[0]?.totalLikes || 0),

        // Recent comments (last 5)
        Comment.find({ authorId: userId, isDeleted: false })
          .populate('promptId', 'title')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),

        // Top comments (most liked)
        Comment.find({ authorId: userId, isDeleted: false })
          .populate('promptId', 'title')
          .sort({ likes: -1, createdAt: -1 })
          .limit(5)
          .lean()
      ])

      return {
        totalComments,
        totalLikes,
        recentComments: recentComments.map(comment => this.formatComment(comment)),
        topComments: topComments.map(comment => this.formatComment(comment))
      }
    } catch (error) {
      console.error('Error getting user comment activity:', error)
      throw error
    }
  }

  /**
   * Get comment statistics for a prompt
   */
  static async getPromptCommentStats(promptId: string) {
    try {
      const [totalComments, totalReplies, topCommenters] = await Promise.all([
        // Total top-level comments
        Comment.countDocuments({ promptId, parentId: null, isDeleted: false }),

        // Total replies
        Comment.countDocuments({ promptId, parentId: { $ne: null }, isDeleted: false }),

        // Top commenters
        Comment.aggregate([
          { $match: { promptId, isDeleted: false } },
          { $group: { _id: '$authorId', commentCount: { $sum: 1 } } },
          { $sort: { commentCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user',
              pipeline: [{ $project: { name: 1 } }]
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              userId: '$_id',
              userName: '$user.name',
              commentCount: 1
            }
          }
        ])
      ])

      return {
        totalComments,
        totalReplies,
        topCommenters
      }
    } catch (error) {
      console.error('Error getting prompt comment stats:', error)
      throw error
    }
  }

  /**
   * Format comment object for API response
   */
  private static formatComment(comment: any): CommentType {
    return {
      _id: comment._id.toString(),
      content: comment.content,
      promptId: comment.promptId.toString(),
      authorId: comment.authorId._id?.toString() || comment.authorId.toString(),
      author: {
        _id: comment.authorId._id?.toString() || comment.authorId.toString(),
        name: comment.authorId.name || 'Unknown User',
        avatar: comment.authorId.avatar
      },
      parentId: comment.parentId?.toString(),
      depth: comment.depth || 0,
      likes: comment.likes || 0,
      likedBy: comment.likedBy?.map((id: any) => id.toString()) || [],
      isEdited: comment.isEdited || false,
      editedAt: comment.editedAt,
      isDeleted: comment.isDeleted || false,
      deletedAt: comment.deletedAt,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    }
  }

  /**
   * Format comment with replies for threaded display
   */
  private static formatCommentWithReplies(comment: any): CommentWithReplies {
    const baseComment = this.formatComment(comment)

    return {
      ...baseComment,
      replies: (comment.replies || []).map((reply: any) => this.formatCommentWithReplies(reply)),
      replyCount: comment.replyCount || 0
    }
  }
}
