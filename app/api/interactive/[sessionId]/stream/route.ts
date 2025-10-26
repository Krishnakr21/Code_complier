import { NextRequest } from "next/server"
import { addSessionListener, getSession } from "@/lib/interactive-executor"

export const runtime = "nodejs"

export async function GET(_req: NextRequest, { params }: { params: { sessionId: string } }) {
  const { sessionId } = params
  const session = getSession(sessionId)
  if (!session) {
    return new Response("Session not found", { status: 404 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (obj: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      }
      // initial event
      send({ type: "ready" })

      const off = addSessionListener(sessionId, (ev) => send(ev))

      // heartbeat every 15s to keep connection alive
      const hb = setInterval(() => {
        controller.enqueue(encoder.encode(`:\n\n`))
      }, 15000)

      const onClose = () => {
        clearInterval(hb)
        off()
        try { controller.close() } catch {}
      }

      // auto cleanup when process exits (handled by listener sending exit)
      const offExit = addSessionListener(sessionId, (ev) => {
        if (ev.type === "exit") {
          onClose()
        }
      })

      // In case stream is cancelled by client
      // @ts-ignore
      controller.signal?.addEventListener?.("abort", onClose)

      // ensure we remove the exit listener on close
      const offCombined = () => { off(); offExit(); clearInterval(hb) }
      // @ts-ignore
      controller._off = offCombined
    },
    cancel() {
      // @ts-ignore
      if (this._off) this._off()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
