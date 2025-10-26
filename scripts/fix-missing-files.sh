#!/bin/bash

echo "🔧 Fixing missing files and dependencies..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in project directory. Please run from project root."
    exit 1
fi

# Create lib directory if it doesn't exist
mkdir -p lib

# Check if piston-executor.ts exists
if [ ! -f "lib/piston-executor.ts" ]; then
    echo "⚠️ Creating missing lib/piston-executor.ts..."
    cat > lib/piston-executor.ts << 'EOF'
export interface ExecutionResult {
  success: boolean
  output?: string
  error?: string
}

const languageMap: Record<string, { piston: string; ext: string; version?: string }> = {
  javascript: { piston: "javascript", ext: "js", version: "18.15.0" },
  python: { piston: "python", ext: "py", version: "3.10.0" },
  java: { piston: "java", ext: "java", version: "15.0.2" },
  cpp: { piston: "cpp", ext: "cpp", version: "10.2.0" },
}

export async function executeWithPiston(language: string, code: string, input: string): Promise<ExecutionResult> {
  const meta = languageMap[language]
  if (!meta) return { success: false, error: `Unsupported language: ${language}` }

  let processedCode = code
  let processedInput = input

  if (language === "java") {
    processedCode = code.replace(/public\s+class\s+\w+/g, "public class Main")
    if (processedInput && !processedInput.endsWith("\n")) {
      processedInput = processedInput + "\n"
    }
  }

  const payload = {
    language: meta.piston,
    version: meta.version || "*",
    files: [{ name: `main.${meta.ext}`, content: processedCode }],
    stdin: processedInput,
    compile_timeout: 10000,
    run_timeout: 5000,
  }

  try {
    const res = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "OnlineCompiler/1.0",
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      return {
        success: false,
        error: `Remote service error ${res.status}: ${res.statusText}`,
      }
    }

    const data = await res.json()

    if (data.compile && data.compile.code !== 0) {
      return {
        success: false,
        error: `Compilation Error:\n${data.compile.stderr || data.compile.output || "Unknown compilation error"}`,
      }
    }

    const { run } = data
    if (run.code === 0) {
      return {
        success: true,
        output: run.stdout || run.output || "Program executed successfully (no output)",
      }
    }

    let errorMessage = run.stderr || run.output || `Process exited with code ${run.code}`

    if (errorMessage.includes("NoSuchElementException")) {
      errorMessage = `❌ Input Missing Error: Your code expects input but none provided.\n\n🔧 Try adding input like "5 10" for two integers.\n\nOriginal error:\n${errorMessage}`
    }

    return {
      success: false,
      error: errorMessage,
    }
  } catch (error) {
    console.error("Piston execution error:", error)
    return {
      success: false,
      error: "Network error: Failed to connect to execution service",
    }
  }
}
EOF
    echo "✅ Created lib/piston-executor.ts"
else
    echo "✅ lib/piston-executor.ts already exists"
fi

# Restart the development server
echo ""
echo "🔄 Please restart your development server:"
echo "   Ctrl+C to stop current server"
echo "   npm run dev to restart"
echo ""
echo "✅ Fix complete! The Piston API should now work properly."
