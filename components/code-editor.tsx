"use client"

import { useState } from "react"
import { Editor } from "@monaco-editor/react"
import { Textarea } from "@/components/ui/textarea"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  dark?: boolean
}

export default function CodeEditor({ value, onChange, language, dark = false }: CodeEditorProps) {
  const [editorFailed, setEditorFailed] = useState(false)

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case "javascript":
        return "javascript"
      case "python":
        return "python"
      case "java":
        return "java"
      case "cpp":
        return "cpp"
      default:
        return "javascript"
    }
  }

  const handleEditorChange = (newValue: string | undefined) => {
    onChange(newValue || "")
  }

  const handleEditorDidMount = () => {
    console.log("Monaco Editor mounted successfully")
  }

  const handleEditorError = (error: any) => {
    console.error("Monaco Editor failed to load:", error)
    setEditorFailed(true)
  }

  if (editorFailed) {
    return (
      <div className="h-[400px] border border-gray-200 rounded-lg overflow-hidden">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Write your ${language} code here...`}
          className="h-full resize-none font-mono text-sm border-0 focus-visible:ring-0"
          style={{ minHeight: "400px" }}
        />
      </div>
    )
  }

  return (
    <div className="h-[400px] border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-900">
      <Editor
        height="400px"
        language={getMonacoLanguage(language)}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={dark ? "vs-dark" : "vs-light"}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading editor...</p>
            </div>
          </div>
        }
        options={{
          fontSize: 14,
          lineNumbers: "on",
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          minimap: { enabled: false },
          wordWrap: "on",
          tabSize: 2,
          insertSpaces: true,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          glyphMargin: false,
          contextmenu: true,
          mouseWheelZoom: true,
          smoothScrolling: true,
          cursorBlinking: "blink",
          cursorSmoothCaretAnimation: "on",
          renderWhitespace: "selection",
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
      />
    </div>
  )
}
