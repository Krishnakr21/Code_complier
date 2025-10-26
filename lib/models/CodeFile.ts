import mongoose, { type Document, Schema } from "mongoose"

export interface ICodeFile extends Document {
  _id: string
  userId: string
  name: string
  language: string
  code: string
  input: string
  description?: string
  tags: string[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  lastExecutedAt?: Date
  executionCount: number
}

const CodeFileSchema = new Schema<ICodeFile>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
      maxlength: [100, "File name cannot exceed 100 characters"],
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      enum: ["javascript", "python", "java", "cpp"],
    },
    code: {
      type: String,
      required: [true, "Code is required"],
    },
    input: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    lastExecutedAt: {
      type: Date,
      default: null,
    },
    executionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Create compound indexes for better performance
CodeFileSchema.index({ userId: 1, createdAt: -1 })
CodeFileSchema.index({ userId: 1, name: 1 })
CodeFileSchema.index({ isPublic: 1, createdAt: -1 })
CodeFileSchema.index({ language: 1, isPublic: 1 })

export default mongoose.models.CodeFile || mongoose.model<ICodeFile>("CodeFile", CodeFileSchema)
