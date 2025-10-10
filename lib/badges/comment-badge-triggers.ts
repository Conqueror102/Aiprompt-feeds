/**
 * Comment Badge Triggers
 * 
 * Automatic badge checking triggers for comment-related actions.
 * Integrates with the existing badge system to award comment badges.
 */

import { BadgeService } from '@/services/badge-service'
import Comment from '@/lib/models/Comment'
import User from '@/lib/models/User'

/**
 * Trigger badge checks after comment creation
 */
export async function triggerBadgesAfterCommentCreate(userId: string, commentData: any) {
  try {
    // Update user comment stats
    const User = await import('@/lib/models/User').then(m => m.default)
    const user = await User.findById(userId)
    
    if (!user) return []

    // Calculate comment stats
    const totalComments = await Comment.countDocuments({ 
      authorId: userId, 
      isDeleted: false 
    })

    const totalCommentLikes = await Comment.aggregate([
      { $match: { authorId: userId, isDeleted: false } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]).then(result => result[0]?.totalLikes || 0)

    const totalReplies = await Comment.countDocuments({
      authorId: userId,
      parentId: { $ne: null },
      isDeleted: false
    })

    const commentsWithReplies = await Comment.aggregate([
      { $match: { authorId: userId, parentId: null, isDeleted: false } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'parentId',
          as: 'replies'
        }
      },
      { $match: { 'replies.0': { $exists: true } } },
      { $count: 'count' }
    ]).then(result => result[0]?.count || 0)

    const uniqueUsersHelped = await Comment.aggregate([
      { 
        $match: { 
          authorId: userId, 
          parentId: { $ne: null }, 
          isDeleted: false 
        } 
      },
      {
        $lookup: {
          from: 'comments',
          localField: 'parentId',
          foreignField: '_id',
          as: 'parentComment'
        }
      },
      { $unwind: '$parentComment' },
      { $group: { _id: '$parentComment.authorId' } },
      { $count: 'count' }
    ]).then(result => result[0]?.count || 0)

    // Update user stats
    await BadgeService.updateUserStats(userId, {
      totalComments,
      totalCommentLikes,
      totalReplies,
      commentsWithReplies,
      uniqueUsersHelped
    })

    // Check badges
    const newBadges = await BadgeService.checkUserBadges(userId)
    return newBadges
  } catch (error) {
    console.error('Error triggering badges after comment create:', error)
    return []
  }
}

/**
 * Trigger badge checks after comment receives a like
 */
export async function triggerBadgesAfterCommentLike(commentId: string, userId: string) {
  try {
    const comment = await Comment.findById(commentId)
    if (!comment) return []

    const commentAuthorId = comment.authorId.toString()
    
    // Recalculate comment like stats for the comment author
    const totalCommentLikes = await Comment.aggregate([
      { $match: { authorId: commentAuthorId, isDeleted: false } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]).then(result => result[0]?.totalLikes || 0)

    await BadgeService.updateUserStats(commentAuthorId, {
      totalCommentLikes
    })

    // Check badges for comment author
    const newBadges = await BadgeService.checkUserBadges(commentAuthorId)
    return newBadges
  } catch (error) {
    console.error('Error triggering badges after comment like:', error)
    return []
  }
}

/**
 * Trigger badge checks after reply is created
 */
export async function triggerBadgesAfterReplyCreate(replyData: any, userId: string) {
  try {
    // This is similar to comment create but specifically for replies
    // We can reuse the comment create trigger
    return await triggerBadgesAfterCommentCreate(userId, replyData)
  } catch (error) {
    console.error('Error triggering badges after reply create:', error)
    return []
  }
}

/**
 * Recalculate all comment stats for a user (useful for data migration)
 */
export async function recalculateUserCommentStats(userId: string) {
  try {
    const [
      totalComments,
      totalCommentLikes,
      totalReplies,
      commentsWithReplies,
      uniqueUsersHelped
    ] = await Promise.all([
      // Total comments
      Comment.countDocuments({ authorId: userId, isDeleted: false }),
      
      // Total likes on comments
      Comment.aggregate([
        { $match: { authorId: userId, isDeleted: false } },
        { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
      ]).then(result => result[0]?.totalLikes || 0),
      
      // Total replies made
      Comment.countDocuments({
        authorId: userId,
        parentId: { $ne: null },
        isDeleted: false
      }),
      
      // Comments that received replies
      Comment.aggregate([
        { $match: { authorId: userId, parentId: null, isDeleted: false } },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'parentId',
            as: 'replies'
          }
        },
        { $match: { 'replies.0': { $exists: true } } },
        { $count: 'count' }
      ]).then(result => result[0]?.count || 0),
      
      // Unique users helped through replies
      Comment.aggregate([
        { 
          $match: { 
            authorId: userId, 
            parentId: { $ne: null }, 
            isDeleted: false 
          } 
        },
        {
          $lookup: {
            from: 'comments',
            localField: 'parentId',
            foreignField: '_id',
            as: 'parentComment'
          }
        },
        { $unwind: '$parentComment' },
        { $group: { _id: '$parentComment.authorId' } },
        { $count: 'count' }
      ]).then(result => result[0]?.count || 0)
    ])

    // Update user stats
    await BadgeService.updateUserStats(userId, {
      totalComments,
      totalCommentLikes,
      totalReplies,
      commentsWithReplies,
      uniqueUsersHelped
    })

    return {
      totalComments,
      totalCommentLikes,
      totalReplies,
      commentsWithReplies,
      uniqueUsersHelped
    }
  } catch (error) {
    console.error('Error recalculating user comment stats:', error)
    throw error
  }
}
