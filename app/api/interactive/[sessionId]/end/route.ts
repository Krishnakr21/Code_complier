import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/interactive-executor"

export const runtime = "nodejs"

export async function POST(_req: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })

    session.end()
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to end input" }, { status: 500 })
  }
}
