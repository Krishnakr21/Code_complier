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

export async function GET(request: NextRequest) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const files = await CodeFile.find({ userId: user.userId }).sort({ updatedAt: -1 }).lean()

    // Convert MongoDB _id to id and format dates
    const formattedFiles = files.map((file) => ({
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
    }))

    return NextResponse.json(formattedFiles)
  } catch (error) {
    console.error("Get files error:", error)
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const { name, language, code, input, description, tags, isPublic } = await request.json()

    const file = await CodeFile.create({
      userId: user.userId,
      name,
      language,
      code,
      input: input || "",
      description: description || "",
      tags: tags || [],
      isPublic: isPublic || false,
    })

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
      executionCount: file.executionCount,
    })
  } catch (error: any) {
    console.error("Create file error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create file" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await getUserFromToken()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await connectDB()

    const { id, name, language, code, input, description, tags, isPublic } = await request.json()

    const file = await CodeFile.findOneAndUpdate(
      { _id: id, userId: user.userId },
      {
        name,
        language,
        code,
        input: input || "",
        description: description || "",
        tags: tags || [],
        isPublic: isPublic || false,
        updatedAt: new Date(),
      },
      { new: true },
    )

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
      executionCount: file.executionCount,
    })
  } catch (error) {
    console.error("Update file error:", error)
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 })
  }
}
