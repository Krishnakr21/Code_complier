import { spawn } from "child_process"
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs"
import { join } from "path"
import { randomUUID } from "crypto"

export interface ExecutionResult {
  success: boolean
  output?: string
  error?: string
}

const LANGUAGE_CONFIGS = {
  javascript: {
    image: "node:18-alpine",
    filename: "main.js",
    command: ["node", "main.js"],
  },
  python: {
    image: "python:3.11-alpine",
    filename: "main.py",
    command: ["python", "main.py"],
  },
  java: {
    image: "openjdk:17-alpine",
    filename: "Main.java",
    command: ["sh", "-c", "javac Main.java && echo 'Compilation successful' && java Main"],
  },
  cpp: {
    image: "gcc:alpine",
    filename: "main.cpp",
    command: ["sh", "-c", "g++ -o main main.cpp && echo 'Compilation successful' && ./main"],
  },
}

export async function executeInDocker(language: string, code: string, input: string): Promise<ExecutionResult> {
  const config = LANGUAGE_CONFIGS[language as keyof typeof LANGUAGE_CONFIGS]

  if (!config) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
    }
  }

  const sessionId = randomUUID()
  const tempDir = join(process.cwd(), "temp", `code-execution-${sessionId}`)

  try {
    // Create temporary directory
    mkdirSync(tempDir, { recursive: true })

    // Write code to file
    const filePath = join(tempDir, config.filename)
    writeFileSync(filePath, code)

    // Write input to file if provided
    if (input.trim()) {
      const inputFile = join(tempDir, "input.txt")
      writeFileSync(inputFile, input)
    }

    // Execute code in Docker container
    const result = await runDockerContainer(config, tempDir, input)

    return result
  } catch (error) {
    console.error("Docker execution error:", error)
    return {
      success: false,
      error: "Failed to execute code in container",
    }
  } finally {
    // Clean up temporary directory
    try {
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true })
      }
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError)
    }
  }
}

function runDockerContainer(config: any, tempDir: string, input: string): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const dockerArgs = [
      "run",
      "--rm",
      "--network=none", // No network access for security
      "--memory=128m", // Memory limit
      "--cpus=0.5", // CPU limit
      "--user=1001:1001", // Run as non-root user
      "-v",
      `${tempDir}:/workspace`,
      "-w",
      "/workspace",
      config.image,
      ...config.command,
    ]

    console.log("Executing Docker command:", "docker", dockerArgs.join(" "))

    const dockerProcess = spawn("docker", dockerArgs, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 15000, // 15 second timeout
    })

    let stdout = ""
    let stderr = ""

    // Provide input to the process if available
    if (input.trim() && dockerProcess.stdin) {
      dockerProcess.stdin.write(input)
      dockerProcess.stdin.end()
    }

    dockerProcess.stdout?.on("data", (data) => {
      stdout += data.toString()
    })

    dockerProcess.stderr?.on("data", (data) => {
      stderr += data.toString()
    })

    dockerProcess.on("close", (code) => {
      console.log(`Process exited with code: ${code}`)
      console.log(`Stdout: ${stdout}`)
      console.log(`Stderr: ${stderr}`)

      if (code === 0) {
        resolve({
          success: true,
          output: stdout.trim(),
        })
      } else {
        resolve({
          success: false,
          error: stderr.trim() || `Process exited with code ${code}`,
        })
      }
    })

    dockerProcess.on("error", (error) => {
      console.error("Docker process error:", error)
      resolve({
        success: false,
        error: `Docker execution failed: ${error.message}`,
      })
    })

    // Handle timeout
    setTimeout(() => {
      dockerProcess.kill("SIGKILL")
      resolve({
        success: false,
        error: "Execution timeout (15 seconds)",
      })
    }, 15000)
  })
}
