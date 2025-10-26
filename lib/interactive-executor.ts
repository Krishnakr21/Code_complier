import { spawn, ChildProcessWithoutNullStreams } from "child_process"
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs"
import { join } from "path"
import { randomUUID } from "crypto"

export type StreamEvent =
  | { type: "stdout"; data: string }
  | { type: "stderr"; data: string }
  | { type: "exit"; code: number | null }
  | { type: "error"; message: string }

export interface InteractiveSession {
  id: string
  language: string
  tempDir: string
  proc: ChildProcessWithoutNullStreams
  send: (data: string) => void
  end: () => void
  kill: () => void
  cleanup: () => void
  addListener: (listener: (ev: StreamEvent) => void) => () => void
}

const LANGUAGE_CONFIGS: Record<string, { image: string; filename: string; command: string[] }> = {
  javascript: {
    image: process.env.DOCKER_NODE_IMAGE || "node:18-alpine",
    filename: "main.js",
    command: ["node", "main.js"],
  },
  python: {
    image: process.env.DOCKER_PYTHON_IMAGE || "python:3.11-alpine",
    filename: "main.py",
    command: ["python", "main.py"],
  },
  java: {
    image: process.env.DOCKER_JAVA_IMAGE || "eclipse-temurin:17-jre-alpine",
    filename: "Main.java",
    command: ["sh", "-c", "javac Main.java && echo 'Compilation successful' && java Main"],
  },
  cpp: {
    image: process.env.DOCKER_CPP_IMAGE || "gcc:alpine",
    filename: "main.cpp",
    command: ["sh", "-c", "g++ -o main main.cpp && echo 'Compilation successful' && ./main"],
  },
}

// In-memory session store
const sessions = new Map<string, InteractiveSession>()
const listeners = new Map<string, Set<(ev: StreamEvent) => void>>()

function emitToListeners(sessionId: string, ev: StreamEvent) {
  const set = listeners.get(sessionId)
  if (!set) return
  set.forEach((l) => {
    try { l(ev) } catch {}
  })
}

export function getSession(id: string): InteractiveSession | undefined {
  return sessions.get(id)
}

export function deleteSession(id: string) {
  const s = sessions.get(id)
  if (s) {
    try { s.kill() } catch {}
    try { s.cleanup() } catch {}
  }
  sessions.delete(id)
  listeners.delete(id)
}

export function createInteractiveSession(
  language: string,
  code: string,
  onEvent?: (ev: StreamEvent) => void,
  options?: { platformArm64?: boolean; timeoutMs?: number }
): InteractiveSession {
  const cfg = LANGUAGE_CONFIGS[language]
  if (!cfg) throw new Error(`Unsupported language: ${language}`)

  const id = randomUUID()
  const tempDir = join(process.cwd(), "temp", `interactive-${id}`)
  mkdirSync(tempDir, { recursive: true })

  // Write code file (normalize Java main class to Main)
  const filePath = join(tempDir, cfg.filename)
  let processed = code
  if (language === "java") {
    processed = processed.replace(/public\s+class\s+\w+/g, "public class Main")
  }
  writeFileSync(filePath, processed)

  const dockerArgs = [
    "run",
    "--rm",
    "--network=none",
    "--memory=256m",
    "--cpus=0.5",
    "-v",
    `${tempDir}:/workspace`,
    "-w",
    "/workspace",
  ]

  if (options?.platformArm64) {
    dockerArgs.push("--platform", "linux/arm64")
  }

  dockerArgs.push(cfg.image, ...cfg.command)

  const proc = spawn("docker", dockerArgs, { stdio: ["pipe", "pipe", "pipe"] })

  const send = (data: string) => {
    try {
      proc.stdin.write(data)
    } catch (e) {
      // ignore
    }
  }

  const end = () => {
    try { proc.stdin.end() } catch {}
  }

  const kill = () => {
    try { proc.kill("SIGKILL") } catch {}
  }

  const cleanup = () => {
    try {
      if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true })
    } catch {}
  }

  // Listener management
  listeners.set(id, new Set())
  const addListener = (listener: (ev: StreamEvent) => void) => {
    const set = listeners.get(id)!
    set.add(listener)
    return () => set.delete(listener)
  }

  const handleEvent = (ev: StreamEvent) => {
    if (onEvent) {
      try { onEvent(ev) } catch {}
    }
    emitToListeners(id, ev)
  }

  proc.stdout.on("data", (d) => handleEvent({ type: "stdout", data: d.toString() }))
  proc.stderr.on("data", (d) => handleEvent({ type: "stderr", data: d.toString() }))
  proc.on("close", (code) => {
    handleEvent({ type: "exit", code })
    cleanup()
    sessions.delete(id)
    listeners.delete(id)
  })
  proc.on("error", (err) => handleEvent({ type: "error", message: err.message }))

  const session: InteractiveSession = { id, language, tempDir, proc, send, end, kill, cleanup, addListener }
  sessions.set(id, session)
  return session
}

export function addSessionListener(sessionId: string, listener: (ev: StreamEvent) => void): () => void {
  const set = listeners.get(sessionId)
  if (!set) throw new Error("Session not found")
  set.add(listener)
  return () => set.delete(listener)
}
