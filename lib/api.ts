export interface ExecutionResult {
  success: boolean
  output?: string
  error?: string
  executionTime?: number
}

export async function executeCode(language: string, code: string, input = ""): Promise<ExecutionResult> {
  try {
    const response = await fetch("/api/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        code,
        input,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error executing code:", error)
    return {
      success: false,
      error: "Failed to execute code. Please try again.",
    }
  }
}

// Interactive API (Docker-based streaming)
export interface StartInteractiveResponse {
  sessionId: string
}

export type InteractiveEvent =
  | { type: "ready" }
  | { type: "stdout"; data: string }
  | { type: "stderr"; data: string }
  | { type: "exit"; code: number | null }
  | { type: "error"; message: string }

export function startInteractive(language: string, code: string, options?: { platformArm64?: boolean }) {
  return fetch("/api/interactive/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, code, platformArm64: options?.platformArm64 ?? false }),
  }).then(async (r) => {
    if (!r.ok) throw new Error(await r.text())
    return (await r.json()) as StartInteractiveResponse
  })
}

export function openInteractiveStream(sessionId: string, onEvent: (ev: InteractiveEvent) => void) {
  const es = new EventSource(`/api/interactive/${sessionId}/stream`)
  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      onEvent(data)
    } catch {
      // ignore malformed events
    }
  }
  es.onerror = () => {
    // stream will auto-close; caller can decide UI changes
  }
  return es
}

export function sendInteractiveInput(sessionId: string, data: string) {
  return fetch(`/api/interactive/${sessionId}/input`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  })
}

export function endInteractiveInput(sessionId: string) {
  return fetch(`/api/interactive/${sessionId}/end`, { method: "POST" })
}

export function killInteractiveSession(sessionId: string) {
  return fetch(`/api/interactive/${sessionId}/kill`, { method: "POST" })
}

// Docker health check (for interactive mode availability)
export async function dockerHealth(): Promise<{ dockerAvailable: boolean }> {
  try {
    const res = await fetch("/api/interactive/health")
    if (!res.ok) return { dockerAvailable: false }
    return (await res.json()) as { dockerAvailable: boolean }
  } catch {
    return { dockerAvailable: false }
  }
}
