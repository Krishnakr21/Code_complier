import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import CodeFile from "@/lib/models/CodeFile"

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
    return user ? { userId: user._id.toString(), email: user.email } : null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const file = await CodeFile.findOne({ _id: params.id, userId: user.userId })
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: file._id.toString(),
      userId: file.userId,
      name: file.name,
      language: file.language,
      code: file.code,
      input: file.input,
      description: file.description,
      tags: file.tags,
      isPublic: file.isPublic,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
      lastExecutedAt: file.lastExecutedAt?.toISOString(),
      executionCount: file.executionCount,
    })
  } catch (error) {
    console.error("Get file error:", error)
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const file = await CodeFile.findOneAndDelete({ _id: params.id, userId: user.userId })
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete file error:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
