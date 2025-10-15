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
    // SEO-friendly URL slug
    slug: {
      type: String,
      unique: true,
      sparse: true, // Allows null values to be non-unique
    },
    // Detailed description for SEO (300+ words recommended)
    detailedDescription: {
      type: String,
      default: "",
    },
    // Use cases for the prompt
    useCases: {
      type: [String],
      default: [],
    },
    // How to use instructions
    howToUse: {
      type: String,
      default: "",
    },
    // Tips for best results
    tips: {
      type: [String],
      default: [],
    },
    // Example inputs/outputs
    examples: [{
      input: String,
      output: String,
    }],
    // SEO metadata
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      ogImage: String,
      canonicalUrl: String,
    },
    // Analytics tracking
    analytics: {
      views: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      lastViewed: Date,
    },
    // Search engine indexing
    isIndexable: {
      type: Boolean,
      default: true,
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
// Note: slug index is auto-created by unique: true

export default mongoose.models.Prompt || mongoose.model("Prompt", PromptSchema)
