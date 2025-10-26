import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

async function getUserFromToken() {
  const token = cookies().get("auth-token")?.value
  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      userId: string
      email: string
    }

    await connectDB()
    const user = await User.findById(decoded.userId)
    return user
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    profile: user.profile,
    preferences: user.preferences,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString(),
  })
}

export async function PUT(request: NextRequest) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, profile, preferences } = await request.json()

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        ...(name && { name }),
        ...(profile && { profile: { ...user.profile, ...profile } }),
        ...(preferences && { preferences: { ...user.preferences, ...preferences } }),
      },
      { new: true, runValidators: true },
    )

    return NextResponse.json({
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      profile: updatedUser.profile,
      preferences: updatedUser.preferences,
      createdAt: updatedUser.createdAt.toISOString(),
      lastLoginAt: updatedUser.lastLoginAt?.toISOString(),
    })
  } catch (error: any) {
    console.error("Update profile error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
