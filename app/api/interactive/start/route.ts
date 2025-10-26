import { NextRequest, NextResponse } from "next/server"
import { createInteractiveSession } from "@/lib/interactive-executor"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { language, code, platformArm64 = false } = body || {}

    if (!language || !code) {
      return NextResponse.json({ error: "language and code are required" }, { status: 400 })
    }

    // Create session and immediately return id; stream endpoint will attach listener
    const session = createInteractiveSession(language, code, undefined, { platformArm64 })
    return NextResponse.json({ sessionId: session.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to start session" }, { status: 500 })
  }
}
