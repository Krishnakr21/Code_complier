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

  // For Java, ensure the class name is Main and fix input formatting
  let processedCode = code
  let processedInput = input

  if (language === "java") {
    // Replace any public class declaration with Main
    processedCode = code.replace(/public\s+class\s+\w+/g, "public class Main")

    // Ensure input ends with newline for Scanner
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
    compile_memory_limit: -1,
    run_memory_limit: -1,
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
    console.log("Piston response:", data)

    // Handle compilation errors
    if (data.compile && data.compile.code !== 0) {
      return {
        success: false,
        error: `Compilation Error:\n${data.compile.stderr || data.compile.output || "Unknown compilation error"}`,
      }
    }

    // Handle runtime
    const { run } = data
    if (run.code === 0) {
      return {
        success: true,
        output: run.stdout || run.output || "Program executed successfully (no output)",
      }
    }

    // Better error handling for common Java exceptions
    let errorMessage = run.stderr || run.output || `Process exited with code ${run.code}`

    if (errorMessage.includes("NoSuchElementException")) {
      errorMessage = `❌ Input Missing Error:
Your code is trying to read input, but no input was provided.

🔧 Quick fixes:
1. Add input in the "Input" section below the code editor
2. For two integers, try: "5 10" or "5\\n10"
3. Make sure you provide enough input values for all Scanner.nextInt() calls

Original error:
${errorMessage}`
    } else if (errorMessage.includes("InputMismatchException")) {
      errorMessage = `❌ Input Format Error: 
${errorMessage}

💡 Common fixes:
- For integers: Use space or newline separation (e.g., "5 10" or "5\\n10")
- For arrays: Put size on first line, elements on second line
- Check if your input matches what Scanner expects`
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
