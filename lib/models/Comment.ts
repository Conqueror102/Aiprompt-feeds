/**
 * Comment Database Model
 * 
 * MongoDB schema for comments with support for nested replies (max 3-4 levels)
 */

import mongoose from "mongoose"
import "./User"
import "./Prompt"

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000, // Plain text limit
    },
    promptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
      required: true,
      index: true, // For efficient prompt comment queries
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // For user comment queries
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true, // For reply queries
    },
    depth: {
      type: Number,
      default: 0,
      min: 0,
      max: 3, // Max 3 levels deep (0, 1, 2, 3)
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // For filtering deleted comments
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
)

// Compound indexes for efficient queries
CommentSchema.index({ promptId: 1, parentId: 1, createdAt: -1 }) // Get comments for prompt
CommentSchema.index({ promptId: 1, isDeleted: 1, createdAt: -1 }) // Get non-deleted comments
CommentSchema.index({ authorId: 1, createdAt: -1 }) // Get user's comments
CommentSchema.index({ parentId: 1, createdAt: 1 }) // Get replies to a comment
CommentSchema.index({ likes: -1, createdAt: -1 }) // Get most liked comments

// Virtual for reply count (calculated field)
CommentSchema.virtual('replyCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId',
  count: true,
  match: { isDeleted: false }
})

// Pre-save middleware to calculate depth
CommentSchema.pre('save', async function(next) {
  if (this.parentId && this.isNew) {
    try {
      const parentComment = await this.constructor.findById(this.parentId)
      if (parentComment) {
        this.depth = Math.min(parentComment.depth + 1, 3) // Max depth of 3
      }
    } catch (error) {
      console.error('Error calculating comment depth:', error)
    }
  }
  next()
})

// Static method to get comment thread with replies
CommentSchema.statics.getThread = async function(commentId: string, maxDepth: number = 3) {
  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(commentId), isDeleted: false } },
    {
      $graphLookup: {
        from: 'comments',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'replies',
        maxDepth: maxDepth,
        depthField: 'replyDepth',
        restrictSearchWithMatch: { isDeleted: false }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'authorId',
        foreignField: '_id',
        as: 'author',
        pipeline: [{ $project: { name: 1, avatar: 1 } }]
      }
    },
    { $unwind: '$author' },
    {
      $addFields: {
        replies: {
          $map: {
            input: '$replies',
            as: 'reply',
            in: {
              $mergeObjects: [
                '$$reply',
                {
                  author: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$replies.author',
                          cond: { $eq: ['$$this._id', '$$reply.authorId'] }
                        }
                      },
                      0
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    }
  ]
  
  const result = await this.aggregate(pipeline)
  return result[0] || null
}

// Static method to get comments for a prompt with pagination
CommentSchema.statics.getPromptComments = async function(
  promptId: string, 
  options: { page?: number; limit?: number; sortBy?: string } = {}
) {
  const { page = 1, limit = 20, sortBy = 'newest' } = options
  const skip = (page - 1) * limit
  
  let sort: any = { createdAt: -1 } // newest first
  if (sortBy === 'oldest') sort = { createdAt: 1 }
  if (sortBy === 'mostLiked') sort = { likes: -1, createdAt: -1 }
  
  const pipeline = [
    { 
      $match: { 
        promptId: new mongoose.Types.ObjectId(promptId),
        parentId: null, // Only top-level comments
        isDeleted: false 
      } 
    },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'authorId',
        foreignField: '_id',
        as: 'author',
        pipeline: [{ $project: { name: 1, avatar: 1 } }]
      }
    },
    { $unwind: '$author' },
    {
      $lookup: {
        from: 'comments',
        let: { commentId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$parentId', '$$commentId'] },
              isDeleted: false
            }
          },
          { $sort: { createdAt: 1 } }, // Replies sorted oldest first
          { $limit: 3 }, // Show first 3 replies
          {
            $lookup: {
              from: 'users',
              localField: 'authorId',
              foreignField: '_id',
              as: 'author',
              pipeline: [{ $project: { name: 1, avatar: 1 } }]
            }
          },
          { $unwind: '$author' }
        ],
        as: 'replies'
      }
    },
    {
      $addFields: {
        replyCount: {
          $size: {
            $ifNull: ['$replies', []]
          }
        }
      }
    }
  ]
  
  const comments = await this.aggregate(pipeline)
  
  // Get total count for pagination
  const totalCount = await this.countDocuments({
    promptId: new mongoose.Types.ObjectId(promptId),
    parentId: null,
    isDeleted: false
  })
  
  return {
    comments,
    total: totalCount,
    hasMore: skip + limit < totalCount,
    page,
    limit
  }
}

export default mongoose.models.Comment || mongoose.model("Comment", CommentSchema)
