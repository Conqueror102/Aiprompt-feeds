import mongoose from "mongoose"

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    savedPrompts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Prompt",
      },
    ],
    likedPrompts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Prompt",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Badge system fields
    badges: [
      {
        badgeId: {
          type: String,
          required: true,
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        level: {
          type: Number,
          default: 1,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],
    // User statistics for badge calculations
    stats: {
      totalPrompts: {
        type: Number,
        default: 0,
      },
      totalLikes: {
        type: Number,
        default: 0,
      },
      totalSaves: {
        type: Number,
        default: 0,
      },
      consecutiveDays: {
        type: Number,
        default: 0,
      },
      lastActiveDate: {
        type: Date,
        default: Date.now,
      },
      categoriesUsed: [
        {
          type: String,
        },
      ],
      agentsUsed: [
        {
          type: String,
        },
      ],
      highestRatedPrompt: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
      },
      promptsWithRating: {
        type: Number,
        default: 0,
      },
      viralPrompts: {
        type: Number,
        default: 0,
      },
      weekendPrompts: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  },
)

export default mongoose.models.User || mongoose.model("User", UserSchema)
