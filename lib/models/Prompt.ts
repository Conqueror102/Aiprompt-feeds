import mongoose from "mongoose"
import "./User"
const PromptSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    aiAgents: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    saves: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: null,
    },
    technologies: {
      type: [String],
      default: [],
    },
    tools: {
      type: [String],
      default: [],
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    // Whether the prompt is private (only visible to owner)
    private: {
      type: Boolean,
      default: false,
    },
    // Comment count for performance
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Add indexes for better query performance
PromptSchema.index({ createdAt: -1 }) // For recent prompts
PromptSchema.index({ rating: -1 }) // For popular/trending prompts
PromptSchema.index({ likes: -1 }) // For most liked prompts
PromptSchema.index({ category: 1, createdAt: -1 }) // For category filtering
PromptSchema.index({ aiAgents: 1, createdAt: -1 }) // For agent filtering
PromptSchema.index({ createdBy: 1, createdAt: -1 }) // For user prompts
PromptSchema.index({ isApproved: 1, private: 1 }) // For filtering approved/public prompts

export default mongoose.models.Prompt || mongoose.model("Prompt", PromptSchema)
