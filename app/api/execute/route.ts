import { type NextRequest, NextResponse } from "next/server"
import { executeWithPiston } from "@/lib/piston-executor"
// Uncomment the line below to use Docker instead of Piston
// import { executeInDocker } from "@/lib/docker-executor"

export async function POST(request: NextRequest) {
  try {
    const { language, code, input = "" } = await request.json()

    if (!language || !code) {
      return NextResponse.json({ success: false, error: "Language and code are required" }, { status: 400 })
    }

    console.log(`Executing ${language} code with Piston API...`)
    const start = Date.now()

    // Use Piston API (default - works without Docker setup)
    const result = await executeWithPiston(language, code, input)

    // Uncomment the line below and comment the line above to use Docker
    // const result = await executeInDocker(language, code, input)

    const end = Date.now()
    console.log(`Execution completed in ${end - start}ms`)

    return NextResponse.json({ ...result, executionTime: end - start })
  } catch (err) {
    console.error("Execution error:", err)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error: " + (err instanceof Error ? err.message : String(err)),
      },
      { status: 500 },
    )
  }
}
