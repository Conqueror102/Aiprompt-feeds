import mongoose from "mongoose"

const RatingSchema = new mongoose.Schema(
  {
    prompt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prompt",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
)

RatingSchema.index({ prompt: 1, user: 1 }, { unique: true })

export default mongoose.models.Rating || mongoose.model("Rating", RatingSchema) 