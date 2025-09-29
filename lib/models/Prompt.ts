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
  },
  {
    timestamps: true,
  },
)


export default mongoose.models.Prompt || mongoose.model("Prompt", PromptSchema)
