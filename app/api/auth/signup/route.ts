import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, email, password } = body

    console.log("Signup attempt:", { name, email })

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      profile: {
        bio: "",
        location: "",
        website: "",
        githubUsername: "",
      },
      preferences: {
        defaultLanguage: "java",
        theme: "light",
        fontSize: 14,
        autoSave: true,
      },
    })

    console.log("User created successfully:", { id: user._id, name: user.name, email: user.email })

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
      },
    })
  } catch (error: any) {
    console.error("Signup error:", error)

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 })
  }
}
