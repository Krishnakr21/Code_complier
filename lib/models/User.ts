import mongoose, { type Document, Schema } from "mongoose"

export interface IUser extends Document {
  _id: string
  name: string
  email: string
  password: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  profile: {
    bio?: string
    location?: string
    website?: string
    githubUsername?: string
  }
  preferences: {
    defaultLanguage: string
    theme: "light" | "dark"
    fontSize: number
    autoSave: boolean
  }
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    avatar: {
      type: String,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    profile: {
      bio: { type: String, maxlength: [500, "Bio cannot exceed 500 characters"] },
      location: { type: String, maxlength: [100, "Location cannot exceed 100 characters"] },
      website: { type: String, maxlength: [200, "Website cannot exceed 200 characters"] },
      githubUsername: { type: String, maxlength: [50, "GitHub username cannot exceed 50 characters"] },
    },
    preferences: {
      defaultLanguage: { type: String, default: "java" },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      fontSize: { type: Number, default: 14, min: 10, max: 24 },
      autoSave: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for better performance (remove duplicate email index)
UserSchema.index({ createdAt: -1 })

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
