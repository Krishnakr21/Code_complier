import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/interactive-executor"

export const runtime = "nodejs"

export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })

    const body = await req.json()
    const { data } = body || {}
    if (typeof data !== "string") {
      return NextResponse.json({ error: "data (string) is required" }, { status: 400 })
    }

    session.send(data)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to send input" }, { status: 500 })
  }
}
