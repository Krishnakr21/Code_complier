"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Play,
  Terminal,
  Clock,
  Loader2,
  Save,
  FolderOpen,
  Trash2,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  User,
  LogOut,
  TestTube,
  Square,
  Cpu,
  Rocket,
  Sun,
  Moon,
  Code,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import CodeEditor from "@/components/code-editor"
import AuthModal from "@/components/auth-modal"
import FileManager from "@/components/file-manager"
import EnhancedCodeExamples from "@/components/enhanced-code-examples"
import { executeCode, startInteractive, openInteractiveStream, sendInteractiveInput, endInteractiveInput, killInteractiveSession, dockerHealth, type InteractiveEvent } from "@/lib/api"
import { saveFile, loadFile, deleteFile, getUserFiles } from "@/lib/file-operations"
import { useToast } from "@/hooks/use-toast"
import { signOut } from "@/lib/auth"
import { LANGUAGES } from "@/lib/code-templates"
import InputHelper from "@/components/input-helper"
import UserProfile from "@/components/user-profile"
import InputValidator from "@/components/input-validator"
import JavaQuickFix from "@/components/java-quick-fix"
import { Switch } from "@/components/ui/switch"

interface CodeFile {
  id: string
  name: string
  language: string
  code: string
  input: string
  createdAt: string
  updatedAt: string
}

export default function OnlineCompiler() {
  const { session, status: sessionStatus } = useSession()
  const { toast } = useToast()

  const [selectedLanguage, setSelectedLanguage] = useState("java")
  const [code, setCode] = useState(LANGUAGES.java.template)
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [executionStatus, setExecutionStatus] = useState<"idle" | "success" | "error">("idle")
  // Interactive mode state
  const [interactiveMode, setInteractiveMode] = useState(false)
  const [interactiveSessionId, setInteractiveSessionId] = useState<string | null>(null)
  const [isInteractiveRunning, setIsInteractiveRunning] = useState(false)
  const [stdinLine, setStdinLine] = useState("")
  const eventSourceRef = (typeof window !== "undefined" ? (window as any) : {}) as { _es?: EventSource }
  // Detect Apple Silicon to choose ARM64 docker platform
  const [isAppleSilicon, setIsAppleSilicon] = useState(false)
  // Refs for focusing inputs via shortcuts
  const batchInputRef = useRef<HTMLTextAreaElement | null>(null)
  const interactiveInputRef = useRef<HTMLInputElement | null>(null)
  // Test cases state (batch mode)
  const [testCases, setTestCases] = useState<{ id: string; name: string; input: string; expected: string }[]>([])
  const [testRunning, setTestRunning] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, { pass: boolean; actual: string }>>({})
  // Test cases UI helpers
  const [expandedCases, setExpandedCases] = useState<Record<string, boolean>>({})

  // Simple unified diff between expected and actual
  function renderUnifiedDiff(expected: string, actual: string) {
    const expLines = (expected || "").split(/\r?\n/)
    const actLines = (actual || "").split(/\r?\n/)
    const maxLen = Math.max(expLines.length, actLines.length)
    const rows: { type: "same" | "add" | "del"; text: string }[] = []
    for (let i = 0; i < maxLen; i++) {
      const e = expLines[i]
      const a = actLines[i]
      if (e === undefined && a !== undefined) rows.push({ type: "add", text: a })
      else if (a === undefined && e !== undefined) rows.push({ type: "del", text: e })
      else if (e === a) rows.push({ type: "same", text: a ?? "" })
      else {
        // mark deletion then addition for changed line
        rows.push({ type: "del", text: e ?? "" })
        rows.push({ type: "add", text: a ?? "" })
      }
    }
    return (
      <pre className="whitespace-pre-wrap font-mono text-xs border rounded p-2 overflow-auto max-h-60">
        {rows.map((r, idx) => (
          <div key={idx} className={r.type === "add" ? "text-green-700" : r.type === "del" ? "text-red-700" : "text-gray-800"}>
            <span className="select-none mr-2 opacity-70">
              {r.type === "add" ? "+" : r.type === "del" ? "-" : " "}
            </span>
            {r.text === "" ? <span className="opacity-60">(empty)</span> : r.text}
          </div>
        ))}
      </pre>
    )
  }
  // Output auto-scroll (Follow)
  const [followOutput, setFollowOutput] = useState(true)
  const outputContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      const ua = navigator.userAgent || ""
      const plat = (navigator as any).platform || ""
      const arch = (navigator as any).userAgentData?.architecture || ""
      const isMac = /Mac/i.test(ua) || /Mac/i.test(plat)
      const isArm = /arm64|aarch64/i.test(ua) || /arm64|aarch64/i.test(plat) || /arm/i.test(arch)
      setIsAppleSilicon(isMac && isArm)
    } catch {
      setIsAppleSilicon(false)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Run: Ctrl/Cmd + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault()
        handleRunCode()
      }
      // Stop: Escape (interactive only)
      if (e.key === "Escape") {
        if (interactiveMode && isInteractiveRunning) {
          e.preventDefault()
          handleStopSession()
        }
      }
      // Focus input: Shift + I
      if (e.shiftKey && (e.key === "I" || e.key === "i")) {
        e.preventDefault()
        if (interactiveMode) interactiveInputRef.current?.focus()
        else batchInputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [interactiveMode, isInteractiveRunning])

  // When toggling Interactive ON, verify Docker availability
  useEffect(() => {
    const checkDocker = async () => {
      if (interactiveMode) {
        const { dockerAvailable } = await dockerHealth()
        if (!dockerAvailable) {
          setInteractiveMode(false)
          toast({ title: "Interactive unavailable", description: "Docker is not running. Falling back to non-interactive mode.", variant: "destructive" })
        }
      }
    }
    checkDocker()
  }, [interactiveMode])

  // Auto-scroll output when new output arrives
  useEffect(() => {
    if (!followOutput) return
    const el = outputContainerRef.current
    if (!el) return
    try {
      el.scrollTop = el.scrollHeight
    } catch {}
  }, [output, followOutput])

  // File management
  const [currentFile, setCurrentFile] = useState<CodeFile | null>(null)
  const [fileName, setFileName] = useState("")
  const [userFiles, setUserFiles] = useState<CodeFile[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showFileManager, setShowFileManager] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Theme toggle (light/dark)
  const [darkMode, setDarkMode] = useState(false)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme:dark")
      const isDark = saved ? saved === "1" : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(isDark)
      document.documentElement.classList.toggle("dark", isDark)
    } catch {}
  }, [])
  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev
      try {
        localStorage.setItem("theme:dark", next ? "1" : "0")
        document.documentElement.classList.toggle("dark", next)
      } catch {}
      return next
    })
  }

  // Load user files on login
  useEffect(() => {
    if (session?.user?.email) {
      loadUserFiles()
    }
  }, [session])

  const loadUserFiles = async () => {
    try {
      const files = await getUserFiles()
      setUserFiles(files)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your files",
        variant: "destructive",
      })
    }
  }

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language)
    if (!currentFile) {
      setCode(LANGUAGES[language as keyof typeof LANGUAGES].template)
    }
    setOutput("")
    setExecutionStatus("idle")
    setExecutionTime(null)
  }

  const handleLoadExample = (exampleCode: string, exampleLanguage: string, exampleInput?: string) => {
    setCode(exampleCode)
    setSelectedLanguage(exampleLanguage)
    setInput(exampleInput || "")
    setOutput("")
    setExecutionStatus("idle")
    setExecutionTime(null)
    setShowExamples(false)

    toast({
      title: "Template Loaded",
      description: "Code template has been loaded successfully",
    })
  }

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No Code",
        description: "Please enter some code to execute",
        variant: "destructive",
      })
      return
    }

    // Reset prior output and timings
    setOutput("")
    setExecutionStatus("idle")
    setExecutionTime(null)

    if (interactiveMode) {
      // Start interactive session (Docker backend required)
      try {
        setIsInteractiveRunning(true)
        const startWall = Date.now()
        const { sessionId } = await startInteractive(selectedLanguage, code, { platformArm64: isAppleSilicon })
        setInteractiveSessionId(sessionId)

        // Open SSE stream and collect output
        if (eventSourceRef._es) {
          try { eventSourceRef._es.close() } catch {}
        }
        const es = openInteractiveStream(sessionId, (ev: InteractiveEvent) => {
          if (ev.type === "stdout") {
            setOutput((prev) => prev + ev.data)
          } else if (ev.type === "stderr") {
            setOutput((prev) => prev + ev.data)
          } else if (ev.type === "exit") {
            const endWall = Date.now()
            setExecutionTime(endWall - startWall)
            setIsInteractiveRunning(false)
            setIsRunning(false)
            setExecutionStatus(ev.code === 0 ? "success" : "error")
            try { es.close() } catch {}
            eventSourceRef._es = undefined
          } else if (ev.type === "error") {
            setOutput((prev) => prev + `\n[error] ${ev.message}\n`)
          }
        })
        eventSourceRef._es = es
        setIsRunning(true)
        toast({ title: "Interactive Session", description: "Session started. Type input below and press Enter to send." })
      } catch (e) {
        setIsInteractiveRunning(false)
        setIsRunning(false)
        setExecutionStatus("error")
        toast({ title: "Failed to start interactive session", variant: "destructive" })
      }
      return
    }

    // Non-interactive (Piston) path
    setIsRunning(true)
    try {
      const startTime = Date.now()
      const result = await executeCode(selectedLanguage, code, input)
      const endTime = Date.now()
      setExecutionTime(endTime - startTime)
      if (result.success) {
        setOutput(result.output || "Program executed successfully (no output)")
        setExecutionStatus("success")
        toast({ title: "Success", description: "Code executed successfully" })
      } else {
        setOutput(result.error || "Unknown error occurred")
        setExecutionStatus("error")
        toast({ title: "Execution Failed", description: "Check the output panel for details", variant: "destructive" })
      }
    } catch (error) {
      setOutput("Failed to execute code. Please try again.")
      setExecutionStatus("error")
      toast({ title: "Network Error", description: "Failed to connect to execution service", variant: "destructive" })
    } finally {
      setIsRunning(false)
    }
  }

  const handleSendInput = async () => {
    if (!interactiveSessionId || !stdinLine.trim()) return
    await sendInteractiveInput(interactiveSessionId, stdinLine + "\n")
    setStdinLine("")
  }

  const handleEndInput = async () => {
    if (!interactiveSessionId) return
    await endInteractiveInput(interactiveSessionId)
  }

  const handleStopSession = async () => {
    if (!interactiveSessionId) return
    await killInteractiveSession(interactiveSessionId)
    try { eventSourceRef._es?.close() } catch {}
    eventSourceRef._es = undefined
    setIsInteractiveRunning(false)
    setIsRunning(false)
    setInteractiveSessionId(null)
  }

  const handleSaveFile = async () => {
    if (!session?.user?.email) {
      toast({
        title: "Authentication Required",
        description: "Please login to save files",
        variant: "destructive",
      })
      return
    }

    if (!fileName.trim()) {
      toast({
        title: "File Name Required",
        description: "Please enter a file name",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const fileData = {
        name: fileName,
        language: selectedLanguage,
        code,
        input,
      }

      let savedFile
      if (currentFile) {
        savedFile = await saveFile({ ...fileData, id: currentFile.id })
      } else {
        savedFile = await saveFile(fileData)
      }

      setCurrentFile(savedFile)
      setShowSaveDialog(false)
      await loadUserFiles()

      toast({
        title: "Success",
        description: `File "${fileName}" saved successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadFile = async (file: CodeFile) => {
    try {
      const loadedFile = await loadFile(file.id)
      setCurrentFile(loadedFile)
      setFileName(loadedFile.name)
      setSelectedLanguage(loadedFile.language)
      setCode(loadedFile.code)
      setInput(loadedFile.input)
      setShowFileManager(false)

      toast({
        title: "Success",
        description: `File "${loadedFile.name}" loaded successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load file",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFile(fileId)
      await loadUserFiles()

      if (currentFile?.id === fileId) {
        setCurrentFile(null)
        setFileName("")
        setCode(LANGUAGES[selectedLanguage as keyof typeof LANGUAGES].template)
        setInput("")
      }

      toast({
        title: "Success",
        description: "File deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const handleNewFile = () => {
    setCurrentFile(null)
    setFileName("")
    setCode(LANGUAGES[selectedLanguage as keyof typeof LANGUAGES].template)
    setInput("")
    setOutput("")
    setExecutionStatus("idle")
    setExecutionTime(null)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const getStatusIcon = () => {
    switch (executionStatus) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Terminal className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (executionStatus) {
      case "success":
        return "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800"
      case "error":
        return "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800"
      default:
        return "bg-gray-50 dark:bg-neutral-900 border-gray-200 dark:border-neutral-700"
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DSA Code Compiler</h1>
                <p className="text-sm text-gray-600">Professional coding environment with test cases</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => setShowExamples(true)} variant="outline" size="sm">
                <TestTube className="h-4 w-4 mr-2" />
                Templates & Tests
              </Button>

              {session?.user ? (
                <>
                  <Button onClick={handleNewFile} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New File
                  </Button>

                  <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save File</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Enter file name"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveFile} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button onClick={() => setShowFileManager(true)} variant="outline" size="sm">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    My Files
                  </Button>

                  <Button onClick={() => setShowProfile(true)} variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    {session.user.email}
                  </div>

                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <AuthModal />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Current File Info */}
        {currentFile && (
          <Card className="mb-4">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{currentFile.name}</span>
                  <Badge variant="outline">{LANGUAGES[currentFile.language as keyof typeof LANGUAGES].name}</Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Last saved: {new Date(currentFile.updatedAt).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Code Editor</CardTitle>
                  <div className="flex items-center gap-3">
                    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LANGUAGES).map(([key, lang]) => (
                          <SelectItem key={key} value={key}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch checked={interactiveMode} onCheckedChange={setInteractiveMode} id="interactive-mode" />
                        <label htmlFor="interactive-mode" className="text-sm text-gray-700">Interactive</label>
                      </div>
                      <Button onClick={handleRunCode} disabled={isRunning} className="bg-indigo-600 hover:bg-indigo-700">
                      {isRunning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run Code
                        </>
                      )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <CodeEditor value={code} onChange={setCode} language={selectedLanguage} dark={darkMode} />
              </CardContent>
            </Card>

            {/* Input Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Input</CardTitle>
              </CardHeader>
              <CardContent>
                {!interactiveMode ? (
                  <Textarea
                    placeholder="Enter your input here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="min-h-[100px] font-mono text-sm mb-4"
                    ref={batchInputRef}
                  />
                ) : (
                  <div className="text-sm text-gray-600 mb-2">Input is sent interactively when the program is running.</div>
                )}

                {/* Add Input Validator */}
                <InputValidator code={code} input={input} language={selectedLanguage} />

                {/* Add Java Quick Fix */}
                {selectedLanguage === "java" && (
                  <JavaQuickFix onSetInput={setInput} onSetCode={setCode} currentCode={code} />
                )}

                {/* Input Helper */}
                <InputHelper
                  onUseExample={(exampleInput) => setInput(exampleInput)}
                  currentLanguage={selectedLanguage}
                />
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon()}
                    Output
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {executionTime !== null && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {executionTime}ms
                      </Badge>
                    )}
                    <Badge
                      variant={
                        executionStatus === "success"
                          ? "default"
                          : executionStatus === "error"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {LANGUAGES[selectedLanguage as keyof typeof LANGUAGES].name}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(output || "")
                          toast({ title: "Copied", description: "Output copied to clipboard" })
                        } catch {
                          toast({ title: "Copy failed", description: "Clipboard not available", variant: "destructive" })
                        }
                      }}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([output || ""], { type: "text/plain;charset=utf-8" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `output-${Date.now()}.txt`
                        document.body.appendChild(a)
                        a.click()
                        a.remove()
                        URL.revokeObjectURL(url)
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      variant={followOutput ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFollowOutput((v) => !v)}
                    >
                      {followOutput ? "Following" : "Follow"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setOutput("")}>Clear Output</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div ref={outputContainerRef} className={`min-h-[400px] max-h-[60vh] overflow-auto p-4 rounded-lg border-2 ${getStatusColor()}`}>
                  {output ? (
                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-100">{output}</pre>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <TestTube className="h-5 w-5" />
                          <span>Output will appear here</span>
                        </div>
                        <div className="text-xs mt-1 text-gray-400 dark:text-gray-300/70">Run your code to see output</div>
                      </div>
                    </div>
                  )}
                </div>
                {interactiveMode && (
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      placeholder="Type input and press Enter to send"
                      value={stdinLine}
                      onChange={(e) => setStdinLine(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleSendInput()
                        }
                      }}
                      disabled={!isInteractiveRunning}
                      ref={interactiveInputRef}
                    />
                    <Button variant="outline" onClick={handleSendInput} disabled={!isInteractiveRunning || !stdinLine.trim()}>
                      Send
                    </Button>
                    <Button variant="outline" onClick={handleEndInput} disabled={!isInteractiveRunning}>
                      End input
                    </Button>
                    <Button variant="destructive" onClick={handleStopSession} disabled={!isInteractiveRunning}>
                      Stop
                    </Button>
                    <Badge variant={isInteractiveRunning ? "default" : "secondary"}>
                      {isInteractiveRunning ? "Interactive: Running" : "Interactive: Ready"}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Cases (Batch Mode) */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Test Cases</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTestCases((prev) => [
                          ...prev,
                          { id: `${Date.now()}-${prev.length + 1}`,
                            name: `Case ${prev.length + 1}`,
                            input: input,
                            expected: "" },
                        ])
                      }
                    >
                      Add from Input
                    </Button>
                    <Button
                      size="sm"
                      disabled={testRunning || testCases.length === 0}
                      onClick={async () => {
                        setTestRunning(true)
                        const results: Record<string, { pass: boolean; actual: string }> = {}
                        for (const tc of testCases) {
                          const res = await executeCode(selectedLanguage, code, tc.input)
                          const actual = (res.output ?? res.error ?? "").trim()
                          const expected = (tc.expected ?? "").trim()
                          results[tc.id] = { pass: res.success && (expected ? actual === expected : true), actual }
                        }
                        setTestResults(results)
                        setTestRunning(false)
                      }}
                    >
                      {testRunning ? "Running..." : "Run All"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {testCases.length === 0 ? (
                  <div className="text-sm text-gray-600">No test cases yet. Click "Add from Input" to create one from the current Input.</div>
                ) : (
                  <div className="space-y-4">
                    {testCases.map((tc) => (
                      <div key={tc.id} className="border rounded-md p-3 bg-white/70">
                        <div className="flex items-center justify-between mb-2">
                          <Input
                            value={tc.name}
                            onChange={(e) => setTestCases((prev) => prev.map((t) => (t.id === tc.id ? { ...t, name: e.target.value } : t)))}
                            className="max-w-xs"
                          />
                          <div className="flex items-center gap-2">
                            <Badge variant={testResults[tc.id]?.pass ? "default" : testResults[tc.id] ? "destructive" : "secondary"}>
                              {testResults[tc.id] ? (testResults[tc.id].pass ? "PASS" : "FAIL") : "PENDING"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedCases((prev) => ({ ...prev, [tc.id]: !prev[tc.id] }))}
                            >
                              {expandedCases[tc.id] ?? true ? "Collapse" : "Expand"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                setTestRunning(true)
                                const res = await executeCode(selectedLanguage, code, tc.input)
                                const actual = (res.output ?? res.error ?? "").trim()
                                const expected = (tc.expected ?? "").trim()
                                setTestResults((prev) => ({ ...prev, [tc.id]: { pass: res.success && (expected ? actual === expected : true), actual } }))
                                setTestRunning(false)
                              }}
                            >
                              Run
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setTestCases((prev) => prev.filter((t) => t.id !== tc.id))}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        {(expandedCases[tc.id] ?? true) && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Input</div>
                                <Textarea
                                  value={tc.input}
                                  onChange={(e) => setTestCases((prev) => prev.map((t) => (t.id === tc.id ? { ...t, input: e.target.value } : t)))}
                                  className="font-mono text-sm min-h-[80px]"
                                />
                              </div>
                              <div>
                                <div className="text-xs text-gray-600 mb-1">Expected Output (optional exact match)</div>
                                <Textarea
                                  value={tc.expected}
                                  onChange={(e) => setTestCases((prev) => prev.map((t) => (t.id === tc.id ? { ...t, expected: e.target.value } : t)))}
                                  className="font-mono text-sm min-h-[80px]"
                                />
                              </div>
                            </div>
                            {testResults[tc.id] && (
                              <div className="mt-3 text-xs space-y-2">
                                <div className="text-gray-600">Diff (Expected vs Actual)</div>
                                {renderUnifiedDiff((tc.expected ?? "").trim(), testResults[tc.id].actual)}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      

      {/* Floating Action Bar */}
      <div className="fixed z-40 bottom-6 right-6">
        <div className="backdrop-blur-xl bg-white/70 dark:bg-neutral-900/70 border shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3">
          <Badge variant={interactiveMode ? (isInteractiveRunning ? "default" : "secondary") : "secondary"}>
            {interactiveMode ? (isInteractiveRunning ? "Interactive: Running" : "Interactive: Ready") : "Batch Mode"}
          </Badge>
          <div className="h-6 w-px bg-gray-300" />
          <Button size="sm" variant="default" className="gap-2" onClick={handleRunCode}>
            <Play className="h-4 w-4" /> Run
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={handleStopSession} disabled={!interactiveMode || !isInteractiveRunning}>
            <Square className="h-4 w-4" /> Stop
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <Button
            size="sm"
            variant={interactiveMode ? "default" : "outline"}
            className="gap-2"
            onClick={async () => {
              if (!interactiveMode) {
                // turning on -> ensure docker
                const { dockerAvailable } = await dockerHealth()
                if (!dockerAvailable) {
                  toast({ title: "Docker not running", description: "Interactive mode requires Docker. Falling back to batch.", variant: "destructive" })
                  return
                }
              }
              setInteractiveMode((v) => !v)
            }}
          >
            {interactiveMode ? <Cpu className="h-4 w-4" /> : <Rocket className="h-4 w-4" />} {interactiveMode ? "Interactive" : "Enable Interactive"}
          </Button>
        </div>
      </div>

      {/* File Manager Modal */}
      <FileManager
        open={showFileManager}
        onOpenChange={setShowFileManager}
        files={userFiles}
        onLoadFile={handleLoadFile}
        onDeleteFile={handleDeleteFile}
      />

      {/* Enhanced Examples Modal */}
      <Dialog open={showExamples} onOpenChange={setShowExamples}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              DSA Templates & Test Cases
            </DialogTitle>
          </DialogHeader>
          <EnhancedCodeExamples onLoadExample={handleLoadExample} />
        </DialogContent>
      </Dialog>

      {/* User Profile Modal */}
      <UserProfile open={showProfile} onOpenChange={setShowProfile} />
    </div>
  )
}
