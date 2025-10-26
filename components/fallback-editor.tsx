"use client"

import { Textarea } from "@/components/ui/textarea"

interface FallbackEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
}

export default function FallbackEditor({ value, onChange, language }: FallbackEditorProps) {
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
