import { NextResponse } from "next/server"
import { spawn } from "child_process"

export const runtime = "nodejs"

export async function GET() {
  try {
    const ok = await new Promise<boolean>((resolve) => {
      const p = spawn("docker", ["--version"], { stdio: ["ignore", "pipe", "pipe"], timeout: 3000 })
      let finished = false
      const done = (v: boolean) => {
        if (finished) return
        finished = true
        resolve(v)
      }
      p.on("error", () => done(false))
      p.on("close", (code) => done(code === 0))
      setTimeout(() => {
        try { p.kill("SIGKILL") } catch {}
        done(false)
      }, 3000)
    })
    return NextResponse.json({ dockerAvailable: ok })
  } catch {
    return NextResponse.json({ dockerAvailable: false })
  }
}
